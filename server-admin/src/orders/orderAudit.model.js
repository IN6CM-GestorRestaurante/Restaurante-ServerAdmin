import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Modelo de Auditoría de Órdenes (inmutable).
 * Registra cada acción sobre una orden para trazabilidad y prevención de fraude.
 */
const orderAuditSchema = new Schema({
    orderId:   { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    
    // Quién realizó la acción (snapshot del actor)
    actorId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, required: true },
    actorName: { type: String, required: true },
    
    // Qué acción se realizó
    action: {
        type: String, required: true,
        enum: [
            'ORDER_CREATED',
            'ITEM_ADDED',
            'ITEM_REMOVED',
            'ITEM_QUANTITY_CHANGED',
            'ITEM_STATUS_CHANGED',
            'ORDER_STATUS_CHANGED',
            'ORDER_CANCELLED',
            'MODIFIER_CHANGED',
            'NOTES_CHANGED'
        ]
    },
    
    // Detalle del cambio
    details: {
        menuItemId:       { type: Schema.Types.ObjectId, ref: 'Menu' },
        menuItemName:     { type: String },
        previousQuantity: { type: Number },
        newQuantity:      { type: Number },
        previousStatus:   { type: String },
        newStatus:        { type: String },
        description:      { type: String }
    },
    
    // Contexto operativo
    branchId:  { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    ipAddress: { type: String }
}, {
    timestamps: { createdAt: 'performedAt', updatedAt: false },
    versionKey: false
});

// Índices para consultas de auditoría
orderAuditSchema.index({ orderId: 1, performedAt: -1 });
orderAuditSchema.index({ actorId: 1, performedAt: -1 });

/**
 * INMUTABLE: Los registros de auditoría no se pueden modificar ni eliminar.
 */
orderAuditSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete'], function (next) {
    next(new Error('Los registros de auditoría son inmutables.'));
});

export default mongoose.model('OrderAudit', orderAuditSchema);
