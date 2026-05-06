import Ingredient from './ingredient.model.js';

export const getIngredients = async (req, res, next) => {
    try {
        const ingredients = await Ingredient.find();
        res.status(200).json({ success: true, data: ingredients });
    } catch (error) {
        next(error);
    }
};

export const createIngredient = async (req, res, next) => {
    try {
        const ingredient = new Ingredient(req.body);
        await ingredient.save();
        res.status(201).json({ success: true, data: ingredient });
    } catch (error) {
        next(error);
    }
};
