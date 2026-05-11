import mongoose from 'mongoose';

/**
 * Modelo de Ingrediente (Ingredient)
 * Define los insumos básicos utilizados en las recetas del restaurante.
 */
const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del ingrediente es obligatorio'],
        trim: true
        // unique: true // Eliminado para permitir el mismo nombre en diferentes empresas
    },
    unit: {
        type: String,
        required: [true, 'La unidad de medida es obligatoria (ej: kg, litros, gramos, unidades)'],
        trim: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'El ingrediente debe pertenecer a una empresa']
    },
    costPrice: {
        type: Number,
        required: [true, 'El precio de costo es obligatorio'],
        min: [0, 'El costo no puede ser negativo']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

/**
 * Índice compuesto único por Nombre y Empresa.
 * Permite que diferentes empresas tengan un ingrediente con el mismo nombre (ej: "Pollo"),
 * pero evita duplicados dentro de la misma empresa.
 */
ingredientSchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.model('Ingredient', ingredientSchema);
