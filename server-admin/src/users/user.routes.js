import { Router } from 'express';
import { check } from 'express-validator';
import { login, register, getUsers, getProfile } from './user.controller.js';
import { registerValidator, loginValidator } from '../../middlewares/users-validators.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

router.get('/', validateJWT, getUsers);
router.get('/profile', validateJWT, getProfile);

export default router;