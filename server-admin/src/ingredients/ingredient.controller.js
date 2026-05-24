'use strict';

import Ingredient from './ingredient.model.js';

/**
 * Listar catálogo de ingredientes de la empresa (Tenant Global).
 */
export const getIngredients = async (req, res, next) => {
    try {
        const query = { ...req.tenantFilter, isActive: true };
        
        const ingredients = await Ingredient.find(query)
            .sort({ name: 1 });

        res.status(200).json({ 
            success: true, 
            count: ingredients.length,
            data: ingredients 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener detalle de un ingrediente.
 */
export const getIngredientById = async (req, res, next) => {
    try {
        const ingredient = req.resource || await Ingredient.findOne({ _id: req.params.id, ...req.tenantFilter });
        
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingrediente no encontrado' });
        }

        res.status(200).json({ success: true, data: ingredient });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear nuevo ingrediente en el catálogo de la empresa.
 */
export const createIngredient = async (req, res, next) => {
    try {
        const ingredient = new Ingredient({ 
            ...req.body, 
            companyId: req.companyId 
        });
        
        await ingredient.save();
        res.status(201).json({ success: true, data: ingredient });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar ingrediente.
 */
export const updateIngredient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ingredient = await Ingredient.findByIdAndUpdate(id, req.body, { returnDocument: 'after', runValidators: true });

        res.status(200).json({ 
            success: true, 
            message: 'Ingrediente actualizado exitosamente',
            data: ingredient 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cambiar estado del ingrediente (Soft Delete).
 */
export const changeIngredientStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        
        const ingredient = await Ingredient.findByIdAndUpdate(id, { isActive }, { returnDocument: 'after' });

        res.status(200).json({
            success: true,
            message: `Ingrediente ${isActive ? 'activado' : 'desactivado'} exitosamente`,
            data: ingredient
        });
    } catch (error) {
        next(error);
    }
};
