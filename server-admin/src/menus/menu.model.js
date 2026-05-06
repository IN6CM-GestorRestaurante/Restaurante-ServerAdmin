'use strict';

import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'El menú debe estar vinculado a un restaurante']
    },
    name: {
        type: String,
        required: [true, 'El nombre del plato es obligatorio'],
        trim: true,
        maxLength: [100, 'El nombre no puede exceder los 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true,
        maxLength: [500, 'La descripción no puede exceder los 500 caracteres']
    },
    ingredients: {
        type: [String],
        required: [true, 'Debe indicar al menos un ingrediente']
    },
    recipe: [{
        ingredientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredient',
            required: true
        },
        quantityRequired: {
            type: Number,
            required: true,
            min: [0.01, 'La cantidad requerida debe ser mayor a cero']
        }
    }],
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    category: {
        type: String,
        required: [true, 'El tipo de plato (categoría) es obligatorio'],
        enum: ['Entrada', 'Plato Fuerte', 'Postre', 'Bebida', 'Acompañamiento', 'Otro'],
        message: '{ENUM} no es una categoría válida'
    },
    image: {
        type: String,
        default: 'menus/default_menu'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Menu', menuSchema);