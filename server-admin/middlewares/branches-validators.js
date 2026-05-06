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

    body('phoneNumber')
        .optional()
        .isMobilePhone().withMessage('Debe ser un número de teléfono válido'),

    body('companyId')
        .optional()
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
        .optional()
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),

    body('address')
        .optional()
        .notEmpty().withMessage('La dirección no puede estar vacía'),

    body('phoneNumber')
        .optional()
        .isMobilePhone().withMessage('Debe ser un número de teléfono válido'),

    checkValidators
];

// Validación para activar/desactivar sucursal
export const validateBranchStatusChange = [
    param('id')
        .isMongoId().withMessage('El ID de la sucursal no es válido'),

    checkValidators
];