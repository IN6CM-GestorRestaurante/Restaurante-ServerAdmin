import mongoose from "mongoose";
import Order from "./order.model.js";
import Table from "../tables/table.model.js";
import { deductStockForItems, restoreStockForItems } from "../stocks/stock.service.js";
import Menu from "../menus/menu.model.js";

const VALID_TRANSITIONS = {
    "pending": ["in-kitchen", "cancelled"],
    "in-kitchen": ["ready", "cancelled"],
    "ready": ["delivered", "cancelled"],
    "delivered": ["paid", "cancelled"],
    "paid": [],
    "cancelled": []
};

/**
 * Obtiene órdenes activas de una sucursal específica.
 */
export const getActiveOrdersByBranch = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        const orders = await Order.find({
            branch: branchId,
            status: { $nin: ["paid", "cancelled"] }
        }).populate('tables').populate('waiter', 'name surname');
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

/**
 * Crea una nueva orden y ocupa las mesas correspondientes.
 */
export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { tables, branch, items } = req.body;
        const waiter = req.user._id;

        // Validar disponibilidad de mesas
        const tableUpdates = await Table.updateMany(
            { _id: { $in: tables }, status: "Disponible" },
            { $set: { status: "Ocupada" } },
            { session }
        );

        if (tableUpdates.modifiedCount !== tables.length) {
            throw new Error("Una o más mesas seleccionadas no están disponibles.");
        }

        // Snapshot de precios actuales para la orden
        for (const item of items) {
            const menu = await Menu.findById(item.menuItem).session(session);
            if (!menu) throw new Error(`El platillo ${item.menuItem} no existe.`);
            item.priceAtTime = menu.price;
        }

        const newOrder = new Order({ tables, waiter, branch, items });
        await newOrder.save({ session });

        await session.commitTransaction();
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

/**
 * Actualiza el estado de un ítem individual dentro de una orden.
 * Dispara la lógica de inventario si el ítem entra a cocina o se cancela.
 */
export const updateItemStatus = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { status: nextStatus } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Orden no encontrada" });

        const item = order.items.id(itemId);
        if (!item) return res.status(404).json({ success: false, message: "Ítem no encontrado" });

        // Validar transición de estado
        if (!VALID_TRANSITIONS[item.status]?.includes(nextStatus)) {
            return res.status(400).json({
                success: false,
                message: `Transición no permitida: de ${item.status} a ${nextStatus}`
            });
        }

        const previousStatus = item.status;

        // GESTIÓN DE STOCK
        // 1. Descontar stock si entra a cocina
        if (nextStatus === "in-kitchen" && previousStatus === "pending") {
            await deductStockForItems(order.branch, [{ menuItem: item.menuItem, quantity: item.quantity }]);
        }
        
        // 2. Restaurar stock si se cancela un ítem que ya estaba en proceso
        if (nextStatus === "cancelled" && ["in-kitchen", "ready", "delivered"].includes(previousStatus)) {
            await restoreStockForItems(order.branch, [{ menuItem: item.menuItem, quantity: item.quantity }]);
        }

        item.status = nextStatus;
        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Actualiza el estado global de la orden.
 * Si se cancela, libera mesas y restaura stock de ítems procesados.
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status: nextStatus } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Orden no encontrada" });

        const previousStatus = order.status;

        // Si se cancela la orden globalmente
        if (nextStatus === "cancelled" && previousStatus !== "cancelled") {
            // Liberar mesas
            await Table.updateMany({ _id: { $in: order.tables } }, { $set: { status: "Disponible" } });
            
            // Restaurar stock de todos los ítems que ya estaban descontados (in-kitchen en adelante)
            const itemsToRestore = order.items.filter(item => 
                ["in-kitchen", "ready", "delivered"].includes(item.status)
            );
            
            if (itemsToRestore.length > 0) {
                await restoreStockForItems(order.branch, itemsToRestore);
            }
            
            // Marcar todos los ítems como cancelados
            order.items.forEach(item => item.status = "cancelled");
        }

        // Si se paga la orden
        if (nextStatus === "paid") {
            await Table.updateMany({ _id: { $in: order.tables } }, { $set: { status: "Disponible" } });
            order.items.forEach(item => { if (item.status !== 'cancelled') item.status = "paid"; });
        }

        order.status = nextStatus;
        await order.save();

        res.status(200).json({ success: true, message: "Estado de orden actualizado correctamente", order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};