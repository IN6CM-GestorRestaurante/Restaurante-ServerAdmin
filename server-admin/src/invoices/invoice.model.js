import mongoose, { Schema, model } from "mongoose";

/**
 * Modelo de Factura (Invoice)
 * 
 * Sigue un ciclo de vida estricto:
 * 1. DRAFT: Editable, creada automáticamente al abrir la orden.
 * 2. COMMITTED: Inmutable, emitida cuando el cliente paga.
 * 3. VOIDED: Anulada, inmutable. Requiere una Nota de Crédito.
 */
const InvoiceSchema = new Schema({
    // Número de factura auto-incrementable o referencial (depende de cada tenant)
    invoiceNumber: { type: String, required: true },
    
    // === Referencias Multi-Tenant ===
    orderId:    { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    branchId:   { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    companyId:  { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    
    // === Usuarios ===
    billedBy:   { type: String, required: true },
    customerId: { type: String },
    
    // === Snapshot de ítems (inmutable una vez pasada a COMMITTED) ===
    itemsSnapshot: [{
        menuItemName: { type: String, required: true },
        quantity:     { type: Number, required: true },
        priceAtTime:  { type: Number, required: true },
        subtotal:     { type: Number, required: true }
    }],
    
    // === Totales y Contabilidad ===
    subtotal:     { type: Number, required: true },
    taxRate:      { type: Number, default: 0 },      // ej: 0.12 para el IVA en Guatemala
    taxAmount:    { type: Number, default: 0 },
    totalAmount:  { type: Number, required: true },
    
    // === Datos de Pago ===
    paymentMethod: { type: String, enum: ['CASH', 'CARD', 'TRANSFER', 'MIXED'], default: 'CASH' },
    
    // === Estado y Ciclo de Vida ===
    status: { type: String, enum: ['DRAFT', 'COMMITTED', 'VOIDED'], default: 'DRAFT' },
    
    // === Trazabilidad de Anulaciones ===
    creditNotes: [{ type: Schema.Types.ObjectId, ref: 'CreditNote' }],
    
    // === Timestamps Específicos ===
    committedAt: { type: Date },
    voidedAt:    { type: Date },
    voidReason:  { type: String }
}, { timestamps: true, versionKey: false });

/**
 * Pre-hook: Bloquea modificaciones si la factura ya está emitida.
 * Garantiza inmutabilidad fiscal a nivel de base de datos.
 */
InvoiceSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
    this.model.findOne(this.getQuery()).then(doc => {
        if (doc && doc.status === 'COMMITTED') {
            return next(new Error('Restricción Fiscal: No se pueden modificar facturas emitidas (COMMITTED). Use el flujo de anulación.'));
        }
        next();
    }).catch(next);
});

/**
 * Pre-hook: Bloquea eliminaciones en toda circunstancia.
 * Las facturas ERP no se borran, se anulan (VOIDED).
 */
InvoiceSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], function(next) {
    next(new Error('Restricción Fiscal: Las facturas nunca se eliminan. Deben anularse pasando al estado VOIDED.'));
});

export default model("Invoice", InvoiceSchema);
