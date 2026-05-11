'use strict';

import mongoose from 'mongoose';

/**
 * Modelo de Menú (Menu)
 * Define los platillos (SINGLE) y paquetes (COMBO) ofrecidos por el restaurante.
 */
const menuSchema = new mongoose.Schema({
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'El menú debe estar vinculado a una sucursal']
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'El menú debe pertenecer a una empresa']
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
    itemType: {
        type: String,
        enum: ['SINGLE', 'COMBO'],
        required: [true, 'El tipo de item es obligatorio'],
        default: 'SINGLE'
    },
    category: {
        type: String,
        required: [true, 'El tipo de plato (categoría) es obligatorio'],
        enum: ['Entrada', 'Plato Fuerte', 'Postre', 'Bebida', 'Acompañamiento', 'Combo', 'Otro'],
        message: '{ENUM} no es una categoría válida'
    },
    price: {
        type: Number,
        required: [true, 'El precio base es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    // Receta para items de tipo SINGLE
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
    // Componentes para items de tipo COMBO
    comboItems: [{
        menuItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        }
    }],
    // Gestión de promociones y descuentos
    promotion: {
        isActive: { type: Boolean, default: false },
        discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_PRICE'] },
        discountValue: { type: Number, min: 0 },
        startsAt: { type: Date },
        endsAt: { type: Date }
    },
    image: {
        type: String,
        default: 'menus/default_menu'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/**
 * Virtual que calcula el precio efectivo aplicando promociones si están activas y vigentes.
 */
menuSchema.virtual('effectivePrice').get(function() {
    const now = new Date();
    
    // Si no hay promoción activa o está fuera de vigencia, retornar precio base
    if (!this.promotion || !this.promotion.isActive) return this.price;
    if (this.promotion.startsAt && now < this.promotion.startsAt) return this.price;
    if (this.promotion.endsAt && now > this.promotion.endsAt) return this.price;

    if (this.promotion.discountType === 'PERCENTAGE') {
        const discount = this.price * (this.promotion.discountValue / 100);
        return Math.round((this.price - discount) * 100) / 100;
    }

    if (this.promotion.discountType === 'FIXED_PRICE') {
        return Math.max(0, this.price - this.promotion.discountValue);
    }

    return this.price;
});

/**
 * Hook de validación para asegurar la integridad de datos según el itemType.
 */
menuSchema.pre('validate', function() {
    if (this.itemType === 'COMBO') {
        if (!this.comboItems || this.comboItems.length === 0) {
            throw new Error('Un COMBO debe incluir al menos un item.');
        }
    }

    if (this.itemType === 'SINGLE') {
        if (!this.recipe || this.recipe.length === 0) {
            throw new Error('Un platillo SINGLE debe tener al menos un ingrediente en su receta.');
        }
    }
});

export default mongoose.model('Menu', menuSchema);