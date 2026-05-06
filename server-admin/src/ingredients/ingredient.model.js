import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del ingrediente es obligatorio'],
        trim: true,
        unique: true
    },
    unit: {
        type: String,
        required: [true, 'La unidad de medida es obligatoria (ej: kg, litros, gramos, unidades)'],
        trim: true
    },
    costPrice: {
        type: Number,
        required: [true, 'El precio de costo es obligatorio'],
        min: [0, 'El costo no puede ser negativo']
    }
}, {
    timestamps: true
});

export default mongoose.model('Ingredient', ingredientSchema);
