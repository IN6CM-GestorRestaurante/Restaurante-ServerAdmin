import mongoose from "mongoose";
import Invoice from "./invoice.model.js";
import CreditNote from "./creditNote.model.js";
import Order from "../orders/order.model.js";
import Table from "../tables/table.model.js";

/**
 * Crea una factura en estado DRAFT a partir de una orden activa.
 * Captura un snapshot de los ítems de la orden para evitar inconsistencias futuras.
 */
export const createDraftFromOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const billedBy = req.user._id;

        const order = await Order.findById(orderId).populate("items.menuItem");
        if (!order) return res.status(404).json({ success: false, message: "Orden no encontrada" });

        if (order.status === "paid" || order.status === "cancelled") {
            return res.status(400).json({ success: false, message: "No se puede facturar una orden que ya está pagada o cancelada" });
        }

        // Generar identificador de factura único para el tenant
        // En producción real, esto debería usar una secuencia atómica por sucursal
        const invoiceNumber = `INV-${req.branchId}-${Date.now()}`;

        // Snapshot inmutable de la compra
        const itemsSnapshot = order.items.map(item => ({
            menuItemName: item.menuItem.name,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
            subtotal: item.priceAtTime * item.quantity
        }));

        const invoice = new Invoice({
            invoiceNumber,
            orderId: order._id,
            branchId: order.branch,
            companyId: req.companyId,
            billedBy,
            itemsSnapshot,
            subtotal: order.total,
            taxAmount: 0, // Se puede calcular si taxRate > 0
            totalAmount: order.total,
            status: 'DRAFT'
        });

        await invoice.save();
        res.status(201).json({ success: true, message: "Borrador de factura generado con éxito.", data: invoice });
    } catch (error) {
        next(error);
    }
};

/**
 * Confirma (COMMITS) una factura DRAFT.
 * Pasa a ser legalmente inmutable y marca la orden original como pagada.
 */
export const commitInvoice = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { paymentMethod } = req.body;

        const invoice = await Invoice.findById(id).session(session);
        if (!invoice) throw new Error("Factura no encontrada");
        if (invoice.status !== 'DRAFT') throw new Error(`Operación inválida: La factura está en estado ${invoice.status}`);

        // La marcamos como emitida
        invoice.status = 'COMMITTED';
        invoice.committedAt = new Date();
        if (paymentMethod) invoice.paymentMethod = paymentMethod;

        await invoice.save({ session });

        // Cerrar la orden y liberar sus mesas
        const order = await Order.findById(invoice.orderId).session(session);
        if (order) {
            order.status = "paid";
            order.items.forEach(i => { if (i.status !== 'cancelled') i.status = 'paid'; });
            await order.save({ session });

            await Table.updateMany(
                { _id: { $in: order.tables } }, 
                { $set: { status: "Disponible" } }, 
                { session }
            );
        }

        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Factura emitida (COMMITTED) exitosamente.", data: invoice });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

/**
 * Anula una factura emitida (COMMITTED -> VOIDED).
 * Genera automáticamente una Nota de Crédito para mantener la trazabilidad contable.
 */
export const voidInvoice = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const issuedBy = req.user._id;

        if (!reason) throw new Error("Se requiere justificar el motivo de la anulación (reason).");

        const invoice = await Invoice.findById(id).session(session);
        if (!invoice) throw new Error("Factura no encontrada");
        if (invoice.status !== 'COMMITTED') throw new Error(`Solo se pueden anular facturas emitidas. Estado actual: ${invoice.status}`);

        // 1. Generar la Nota de Crédito vinculada
        const creditNote = new CreditNote({
            creditNoteNumber: `CN-${req.branchId}-${Date.now()}`,
            originalInvoiceId: invoice._id,
            companyId: invoice.companyId,
            branchId: invoice.branchId,
            issuedBy,
            reason,
            amount: invoice.totalAmount,
            status: 'COMMITTED'
        });
        await creditNote.save({ session });

        // 2. Marcar la factura original como anulada.
        // Se utiliza la colección nativa para bypassear el Mongoose Pre-Hook de inmutabilidad
        // ya que la anulación es el único flujo legal que modifica una factura COMMITTED.
        await Invoice.collection.updateOne(
            { _id: invoice._id },
            { 
                $set: { 
                    status: 'VOIDED', 
                    voidedAt: new Date(), 
                    voidReason: reason 
                },
                $push: { creditNotes: creditNote._id }
            },
            { session }
        );

        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Factura anulada. Se generó la respectiva Nota de Crédito.", data: creditNote });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

/**
 * Lista las facturas aplicando automáticamente el filtro de Tenant Isolation.
 */
export const getInvoices = async (req, res, next) => {
    try {
        // req.tenantFilter es inyectado por el middleware injectTenantContext
        const query = { ...req.tenantFilter };
        
        const invoices = await Invoice.find(query)
            .sort({ createdAt: -1 })
            .populate('billedBy', 'name surname')
            .populate('orderId', 'status total');
            
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el detalle de una factura específica, garantizando aislamiento.
 */
export const getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, ...req.tenantFilter })
            .populate('orderId')
            .populate('branchId', 'name address')
            .populate('billedBy', 'name surname')
            .populate('creditNotes');
            
        if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada o sin acceso permitido.' });
        
        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        next(error);
    }
};
