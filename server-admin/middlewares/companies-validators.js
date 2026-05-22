import { body } from 'express-validator';
import { checkValidators } from './check-validators.js';
import Company from '../src/companies/company.model.js';

/**
 * Validador personalizado para verificar si el subdominio está en uso.
 */
const subdomainExists = async (subdomain = '') => {
    const company = await Company.findOne({ subdomain });
    if (company) throw new Error(`El subdominio ${subdomain} ya está en uso`);
};

/**
 * Validador personalizado para verificar si el NIT/TaxID ya existe.
 */
const taxIdExists = async (taxId = '') => {
    const company = await Company.findOne({ taxId });
    if (company) throw new Error(`El NIT/TaxID ${taxId} ya está registrado`);
};

/**
 * Validaciones para el registro unificado de Empresa y Usuario (Saga).
 */
export const registerCompanyValidator = [
    // Datos del Usuario Propietario
    body('name', 'El nombre del propietario es obligatorio').notEmpty(),
    body('surname', 'El apellido del propietario es obligatorio').notEmpty(),
    body('email', 'El correo no es válido').isEmail(),
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    body('phone', 'El teléfono de contacto es obligatorio').notEmpty(),
    
    // Datos de la Empresa
    body('legalName', 'La razón social es obligatoria').notEmpty(),
    body('alias', 'El nombre comercial es obligatorio').notEmpty(),
    body('taxId', 'El NIT/TaxID es obligatorio').notEmpty(),
    body('taxId').custom(taxIdExists),
    body('sector', 'El sector no es válido').isIn(['Restaurante', 'Cafetería', 'Bar', 'Panadería', 'Food Truck', 'Catering', 'Otro']),
    body('companySize', 'El tamaño de empresa no es válido').isIn(['1-10', '11-50', '51-200', '200+']),
    body('country', 'El país de operación es obligatorio').notEmpty(),
    body('subdomain', 'El subdominio es obligatorio').notEmpty(),
    body('subdomain').custom(subdomainExists),
    
    checkValidators
];
