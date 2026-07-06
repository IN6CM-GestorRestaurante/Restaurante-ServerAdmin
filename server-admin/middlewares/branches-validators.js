'use strict';

import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

// Validación para crear una sucursal
export const validateCreateBranch = [
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),

    body('address')
        .notEmpty().withMessage('La dirección es obligatoria'),

    body('description')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 10, max: 500 }).withMessage('La descripción debe tener entre 10 y 500 caracteres'),

    body('email')
        .notEmpty().withMessage('El correo de contacto es obligatorio')
        .isEmail().withMessage('Por favor ingrese un correo electrónico válido'),

    body('phoneNumber')
        .notEmpty().withMessage('El número de teléfono es obligatorio')
        .customSanitizer((value) => String(value || '').replace(/[\s\-\(\)]/g, ''))
        .custom((value) => {
            if (!/^\+?\d{6,15}$/.test(value)) {
                throw new Error('Debe ser un número de teléfono válido (ej: +50212345678 o 12345678)');
            }
            return true;
        }),

    body('openingTime')
        .notEmpty().withMessage('La hora de apertura es obligatoria')
        .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Formato de hora válido (ej: 08:00)'),

    body('closingTime')
        .notEmpty().withMessage('La hora de cierre es obligatoria')
        .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Formato de hora válido (ej: 22:00)'),

    body('category')
        .notEmpty().withMessage('La categoría gastronómica es obligatoria'),

    body('averagePrice')
        .notEmpty().withMessage('El precio promedio es obligatorio')
        .isNumeric().withMessage('El precio debe ser un número válido'),

    body('companyId')
        .optional({ values: 'falsy' })
        .isMongoId().withMessage('Debe ser un ID de compañía válido'),

    checkValidators
];

// Validación para obtener sucursal por ID
export const validateGetBranchById = [
    param('id')
        .isMongoId().withMessage('El ID de la sucursal no es válido'),

    checkValidators
];

// Validación para actualizar una sucursal
export const validateUpdateBranch = [
    param('id')
        .isMongoId().withMessage('El ID de la sucursal no es válido'),

    body('name')
        .optional({ values: 'falsy' })
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),

    body('address')
        .optional({ values: 'falsy' })
        .notEmpty().withMessage('La dirección no puede estar vacía'),

    body('description')
        .optional({ values: 'falsy' })
        .isLength({ min: 10, max: 500 }).withMessage('La descripción debe tener entre 10 y 500 caracteres'),

    body('email')
        .optional({ values: 'falsy' })
        .isEmail().withMessage('Por favor ingrese un correo electrónico válido'),

    body('phoneNumber')
        .optional({ values: 'falsy' })
        .customSanitizer((value) => String(value || '').replace(/[\s\-\(\)]/g, ''))
        .custom((value) => {
            if (!/^\+?\d{6,15}$/.test(value)) {
                throw new Error('Debe ser un número de teléfono válido');
            }
            return true;
        }),

    body('openingTime')
        .optional({ values: 'falsy' })
        .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Formato de hora válido (ej: 08:00)'),

    body('closingTime')
        .optional({ values: 'falsy' })
        .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Formato de hora válido (ej: 22:00)'),

    body('category')
        .optional({ values: 'falsy' })
        .notEmpty().withMessage('La categoría no puede estar vacía'),

    body('averagePrice')
        .optional({ values: 'falsy' })
        .isNumeric().withMessage('El precio debe ser un número válido'),

    checkValidators
];

// Validación para activar/desactivar sucursal
export const validateBranchStatusChange = [
    param('id')
        .isMongoId().withMessage('El ID de la sucursal no es válido'),

    checkValidators
];