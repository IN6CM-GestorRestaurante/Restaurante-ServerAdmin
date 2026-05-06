import mongoose from "mongoose";
import Order from "./order.model.js";
import Table from "../tables/table.model.js";
import Stock from "../stocks/stock.model.js";
import Menu from "../menus/menu.model.js";

const VALID_TRANSITIONS = {
    "pending": ["in-kitchen", "cancelled"],
    "in-kitchen": ["ready"],
    "ready": ["delivered"],
    "delivered": ["paid"],
    "paid": [],
    "cancelled": []
};

// Obtener órdenes activas de la sucursal
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

export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {tables, branch, items} = req.body;
        const waiter = req.usuario._id;

        // Validar que el mesero pertenece a la sucursal si aplica (se asume que el Auth Middleware ya filtró o podemos revalidarlo si req.user.branchId existe)
        if (req.user.role === 'WAITER' && req.user.branchId.toString() !== branch) {
            throw new Error('No puedes crear órdenes para una sucursal en la que no trabajas.');
        }

        // Actualizar múltiples mesas
        const tableUpdates = await Table.updateMany(
            {_id: { $in: tables }, status: "Disponible"},
            {$set: {status: "Ocupada"}},
            {session}
        );

        if (tableUpdates.modifiedCount !== tables.length) {
            throw new Error("Una o más mesas no están disponibles.");
        }

        // Cargar precios actuales (Snapshot temporal)
        for (const item of items) {
            const menu = await Menu.findById(item.menuItem).session(session);
            if (!menu) throw new Error(`El platillo ${item.menuItem} no existe.`);
            item.priceAtTime = menu.price;
        }

        const newOrder = new Order({tables, waiter, branch, items});
        await newOrder.save({session});

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({success: true, order: newOrder});
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({success: false, error: error.message});
    }
};

export const updateItemStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {orderId, itemId} = req.params;
        const {status: nextStatus} = req.body;

        const order = await Order.findById(orderId).session(session);
        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({success: false, message: "Orden no encontrada"});
        }

        const item = order.items.id(itemId);
        if (!item) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({success: false, message: "Ítem no encontrado"});
        }

        if (!VALID_TRANSITIONS[item.status]?.includes(nextStatus)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `No se puede pasar de ${item.status} a ${nextStatus}`
            });
        }

        // Si pasa a cocina, descontar inventario
        if (nextStatus === "in-kitchen" && item.status === "pending") {
            const menu = await Menu.findById(item.menuItem).session(session);
            if (!menu) throw new Error("Platillo no encontrado");

            if (menu.recipe && menu.recipe.length > 0) {
                for (const recipeItem of menu.recipe) {
                    const requiredQuantity = recipeItem.quantityRequired * item.quantity;
                    const stock = await Stock.findOne({
                        branchId: order.branch,
                        ingredientId: recipeItem.ingredientId
                    }).session(session);

                    if (!stock || stock.quantity < requiredQuantity) {
                        throw new Error(`Inventario insuficiente para el ingrediente: ${recipeItem.ingredientId}.`);
                    }

                    stock.quantity -= requiredQuantity;
                    await stock.save({session});
                }
            }
        }

        item.status = nextStatus;
        await order.save({session});

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({success: true, order});
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({success: false, error: error.message});
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        const order = await Order.findByIdAndUpdate(id, {status}, {new: true});
        if (!order) return res.status(404).json({success: false, message: "Orden no encontrada"});

        if (status === "paid" || status === "cancelled") {
            await Table.updateMany({_id: { $in: order.tables }}, {$set: {status: "Disponible"}});
        }

        res.status(200).json({success: true, message: "Estado actualizado y mesa sincronizada"});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
};