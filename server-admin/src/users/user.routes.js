import { Router } from 'express';
import {
	getUsers,
	getProfile,
	syncProfile,
	createUser,
	updateUser,
	changeUserStatus,
} from './user.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { createUserValidator, updateUserValidator } from '../../middlewares/users-validators.js';

const router = Router();

router.post('/sync', syncProfile);

// Rutas protegidas
router.get('/', validateJWT, getUsers);
router.get('/profile', validateJWT, getProfile);
router.post('/', validateJWT, createUserValidator, createUser);
router.put('/:id', validateJWT, updateUserValidator, updateUser);
router.put('/:id/activate', validateJWT, updateUserValidator, changeUserStatus);
router.put('/:id/desactivate', validateJWT, updateUserValidator, changeUserStatus);

export default router;