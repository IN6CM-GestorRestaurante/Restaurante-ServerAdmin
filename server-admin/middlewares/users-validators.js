import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';
import User from '../src/users/user.model.js';

const emailExists = async (email = '') => {
    const existeEmail = await User.findOne({ email });
    if (existeEmail) {
        throw new Error(`El correo ${email} ya está registrado`);
    }
};

const usernameExists = async (username = '') => {
    const existeUsuario = await User.findOne({ username });
    if (existeUsuario) {
        throw new Error(`El nombre de usuario ${username} ya está registrado`);
    }
};

const userExists = async (id = '') => {
    const existeUsuario = await User.findById(id);
    if (!existeUsuario) {
        throw new Error(`El usuario con el ID ${id} no existe`);
    }
};

export const registerValidator = [
    body('name', 'El nombre es obligatorio').notEmpty(),
    body('surname', 'El apellido es obligatorio').notEmpty(),
    body('username', 'El nombre de usuario es obligatorio').notEmpty(),
    body('email', 'El correo no es válido').isEmail(),
    body('email').custom(emailExists),
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    checkValidators
];

export const createUserValidator = [
    body('name', 'El nombre es obligatorio').notEmpty(),
    body('surname', 'El apellido es obligatorio').notEmpty(),
    body('username', 'El nombre de usuario es obligatorio').notEmpty(),
    body('username').custom(usernameExists),
    body('email', 'El correo no es válido').isEmail(),
    body('email').custom(emailExists),
    body('phone', 'El teléfono debe tener 8 caracteres').isLength({ min: 8, max: 8 }),
    body('role', 'El rol no es válido').isIn(['ADMIN', 'CLIENT', 'WAITER']),
    checkValidators
];

export const loginValidator = [
    body('email', 'El correo es obligatorio').isEmail(),
    body('password', 'La contraseña es obligatoria').notEmpty(),
    checkValidators
];

export const updateUserValidator = [
    param('id', 'No es un ID válido').isMongoId(),
    param('id').custom(userExists),
    checkValidators
];