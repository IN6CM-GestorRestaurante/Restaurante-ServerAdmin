import { Router } from 'express';
import { 
    getUsers, 
    getUserById, 
    getProfile, 
    createUser, 
    updateUser, 
    changeUserStatus, 
    syncProfile 
} from './user.controller.js';
import { validateJWT, authorizeRole } from '../../middlewares/auth.middleware.js';
import { injectTenantContext } from '../../middlewares/tenant.middleware.js';

const router = Router();
const auth = [validateJWT, injectTenantContext];

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios y empleados (RBAC + Tenant Isolation)
 */

/**
 * @swagger
 * /users/sync:
 *   post:
 *     summary: Sincroniza datos desde auth-service (Uso interno)
 *     tags: [Users]
 */
router.post('/sync', syncProfile);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', validateJWT, getProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene la lista de empleados del tenant
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    getUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un empleado por su ID verificando propiedad del tenant
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    getUserById
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo empleado asociado a la empresa (Solo COMPANY_ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN'), 
    createUser
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza datos del empleado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN'), 
    updateUser
);

/**
 * @swagger
 * /users/{id}/activate:
 *   put:
 *     summary: Activa un empleado (Soft Delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/activate', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN'), 
    changeUserStatus
);

/**
 * @swagger
 * /users/{id}/desactivate:
 *   put:
 *     summary: Desactiva un empleado (Soft Delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/desactivate', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN'), 
    changeUserStatus
);

export default router;