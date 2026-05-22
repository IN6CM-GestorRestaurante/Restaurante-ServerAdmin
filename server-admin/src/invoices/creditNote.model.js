import mongoose, { Schema, model } from "mongoose";

/**
 * Modelo de Nota de Crédito (CreditNote)
 * 
 * Se utiliza para reversar o ajustar contablemente una factura previamente emitida (COMMITTED).
 * Mantiene la inmutabilidad de la facturación y el rastro de auditoría.
 */
const CreditNoteSchema = new Schema({
    // Número correlativo de la nota de crédito
    creditNoteNumber: { type: String, required: true },
    
    // === Referencias ===
    originalInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    companyId:         { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId:          { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    issuedBy:          { type: String, required: true },
    
    // === Detalles de la Anulación / Ajuste ===
    reason: { type: String, required: true },
    amount: { type: Number, required: true },
    
    // Qué ítems específicos fueron ajustados o devueltos
    itemsAdjusted: [{
        menuItemName: { type: String },
        quantity:     { type: Number },
        amount:       { type: Number }
    }],
    
    // === Estado ===
    status: { type: String, enum: ['DRAFT', 'COMMITTED'], default: 'DRAFT' }
}, { timestamps: true, versionKey: false });

/**
 * Pre-hook: Bloquea modificaciones si la nota ya fue emitida.
 */
CreditNoteSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
    this.model.findOne(this.getQuery()).then(doc => {
        if (doc && doc.status === 'COMMITTED') {
            return next(new Error('Restricción Fiscal: No se pueden modificar Notas de Crédito ya emitidas.'));
        }
        next();
    }).catch(next);
});

/**
 * Pre-hook: Bloquea eliminaciones.
 */
CreditNoteSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], function(next) {
    next(new Error('Restricción Fiscal: Las Notas de Crédito no se pueden eliminar.'));
});

export default model("CreditNote", CreditNoteSchema);
