'use strict';

import {body, param} from 'express-validator';
import {checkValidators} from "./check-validators.js";

export const validateCreateReservation = [
    body('guestName')
        .notEmpty()
        .withMessage('El nombre del cliente es obligatorio')
        .trim(),
    body('branch')
        .notEmpty()
        .withMessage('El ID de la sucursal es obligatorio')
        .isMongoId()
        .withMessage('No es un ID de sucursal válido'),
    body('guestsCount')
        .notEmpty()
        .withMessage('El número de comensales es obligatorio')
        .isInt({ min: 1 })
        .withMessage('Debe ser al menos 1 comensal'),
    body('date')
        .notEmpty()
        .withMessage('La fecha y hora son obligatorias')
        .isISO8601()
        .withMessage('Formato de fecha inválido (debe ser ISO8601)'),
    body('tables')
        .optional()
        .isArray()
        .withMessage('Las mesas deben ser un arreglo'),
    body('tables.*')
        .if(body('tables').exists())
        .isMongoId()
        .withMessage('ID de mesa no válido'),
    body('status')
        .optional()
        .isIn(['Pendiente', 'Confirmada', 'En curso', 'Completada', 'Cancelada'])
        .withMessage('Estado de reservación no válido'),
    body('notes')
        .optional()
        .isString()
        .withMessage('Las notas deben ser texto'),
    checkValidators
];

export const validateUpdateReservation = [
    param('id')
        .notEmpty()
        .withMessage('El ID de la reservación es obligatorio')
        .isMongoId()
        .withMessage('No es un ID de MongoDB válido'),
    body('guestName')
        .optional()
        .trim(),
    body('branch')
        .optional()
        .isMongoId()
        .withMessage('No es un ID de sucursal válido'),
    body('guestsCount')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Debe ser al menos 1 comensal'),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Formato de fecha inválido'),
    body('tables')
        .optional()
        .isArray()
        .withMessage('Las mesas deben ser un arreglo'),
    body('tables.*')
        .if(body('tables').exists())
        .isMongoId()
        .withMessage('ID de mesa no válido'),
    body('status')
        .optional()
        .isIn(['Pendiente', 'Confirmada', 'En curso', 'Completada', 'Cancelada'])
        .withMessage('Estado no válido'),
    body('notes')
        .optional()
        .isString()
        .withMessage('Las notas deben ser texto'),
    checkValidators
];

export const validateGetReservationById = [
    param('id')
        .notEmpty()
        .withMessage('El ID es obligatorio')
        .isMongoId()
        .withMessage('No es un ID de MongoDB válido'),
    checkValidators
];

export const validateReservationStatusChange = [
    param('id')
        .notEmpty()
        .withMessage('El ID es obligatorio')
        .isMongoId()
        .withMessage('No es un ID de MongoDB válido'),
    checkValidators
];