'use strict';

import {body, param} from 'express-validator';
import {checkValidators} from "./check-validators.js";

export const validateCreateMenu = [
    body('branch')
        .notEmpty()
        .withMessage('El ID de la sucursal es obligatorio')
        .isMongoId()
        .withMessage('No es un ID de sucursal válido'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del plato es obligatorio')
        .isLength({min: 3, max: 100})
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('La descripción es obligatoria')
        .isLength({min: 10, max: 500})
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    body('itemType')
        .optional()
        .isIn(['SINGLE', 'COMBO'])
        .withMessage('El tipo de item debe ser SINGLE o COMBO'),
    body('recipe')
        .optional()
        .isArray()
        .withMessage('La receta debe ser un arreglo'),
    body('comboItems')
        .optional()
        .isArray()
        .withMessage('Los items del combo deben ser un arreglo'),
    body('price')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({min: 0})
        .withMessage('El precio no puede ser negativo'),
    body('category')
        .notEmpty()
        .withMessage('La categoría es obligatoria')
        .isIn(['Entrada', 'Plato Fuerte', 'Postre', 'Bebida', 'Acompañamiento', 'Combo', 'Otro'])
        .withMessage('No es una categoría de menú válida'),
    checkValidators
];

export const validateUpdateMenu = [
    param('id')
        .notEmpty()
        .withMessage('El ID del plato es obligatorio')
        .isMongoId()
        .withMessage('No es un ID de MongoDB válido'),
    body('name')
        .optional()
        .isLength({min: 3, max: 100})
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    body('description')
        .optional()
        .isLength({min: 10, max: 500})
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    body('itemType')
        .optional()
        .isIn(['SINGLE', 'COMBO'])
        .withMessage('El tipo de item debe ser SINGLE o COMBO'),
    body('recipe')
        .optional()
        .isArray(),
    body('comboItems')
        .optional()
        .isArray(),
    body('price')
        .optional()
        .isFloat({min: 0})
        .withMessage('El precio no puede ser negativo'),
    body('category')
        .optional()
        .isIn(['Entrada', 'Plato Fuerte', 'Postre', 'Bebida', 'Acompañamiento', 'Combo', 'Otro'])
        .withMessage('Categoría no válida'),
    checkValidators
];

export const validateGetMenuById = [
    param('id')
        .notEmpty()
        .withMessage('El ID es obligatorio')
        .isMongoId()
        .withMessage('No es un ID de MongoDB válido'),
    checkValidators
];

export const validateMenuStatusChange = [
    param('id')
        .notEmpty()
        .withMessage('El ID es obligatorio')
        .isMongoId()
        .withMessage('No es un ID de MongoDB válido'),
    checkValidators
];