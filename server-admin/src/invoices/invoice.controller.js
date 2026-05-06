import mongoose from "mongoose";
import Invoice from "./invoice.model.js";
import Order from "../orders/order.model.js";
import Table from "../tables/table.model.js";
import Menu from "../menus/menu.model.js";

export const checkoutOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { orderId } = req.params;
        const { paymentMethod } = req.body;
        const billedBy = req.usuario._id;

        // Validar que la orden existe
        const order = await Order.findById(orderId).populate("items.menuItem").session(session);
        if (!order) {
            throw new Error("Orden no encontrada");
        }

        if (order.status === "paid" || order.status === "cancelled") {
            throw new Error("La orden ya está cerrada o cancelada");
        }

        // Crear Snapshot Inmutable
        const itemsSnapshot = order.items.map(item => ({
            menuItemName: item.menuItem.name,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
            subtotal: item.priceAtTime * item.quantity
        }));

        const invoice = new Invoice({
            orderId: order._id,
            branchId: order.branch,
            billedBy,
            itemsSnapshot,
            totalAmount: order.total,
            paymentMethod: paymentMethod || "CASH"
        });
        
        await invoice.save({ session });

        // Actualizar orden
        order.status = "paid";
        await order.save({ session });

        // Liberar las mesas
        await Table.updateMany(
            { _id: { $in: order.tables } }, 
            { $set: { status: "Disponible" } }, 
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, data: invoice, message: "Factura generada y orden cerrada." });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export const getInvoicesByBranch = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        const invoices = await Invoice.find({ branchId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        next(error);
    }
};
