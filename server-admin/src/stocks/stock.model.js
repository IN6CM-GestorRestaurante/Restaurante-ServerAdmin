import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'El stock debe pertenecer a una sucursal']
    },
    ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: [true, 'El ingrediente es obligatorio']
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad de inventario es obligatoria'],
        min: [0, 'El stock no puede ser negativo']
    },
    minStock: {
        type: Number,
        required: [true, 'El stock mínimo es obligatorio'],
        min: [0, 'El stock mínimo no puede ser negativo']
    }
}, {
    timestamps: true
});

// Índice compuesto para no repetir el mismo ingrediente en la misma sucursal
stockSchema.index({branchId: 1, ingredientId: 1}, {unique: true});

export default mongoose.model('Stock', stockSchema);
