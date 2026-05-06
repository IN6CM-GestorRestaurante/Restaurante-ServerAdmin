import {Router} from 'express';
import {getProfile, getUsers, syncProfile, updateUser, changeUserStatus} from './user.controller.js'; // <-- Importa syncProfile
import {validateJWT} from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/sync', syncProfile);

// Rutas protegidas
router.get('/', validateJWT, getUsers);
router.get('/profile', validateJWT, getProfile);

router.put('/:id', validateJWT, updateUser);
router.put('/:id/activate', validateJWT, changeUserStatus);
router.put('/:id/desactivate', validateJWT, changeUserStatus);

export default router;