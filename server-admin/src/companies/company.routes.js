import { Router } from 'express';
import { getCompanies, getCompanyById, createCompany } from './company.controller.js';
import { validateJWT, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: API para gestión de Companies (Empresas/Franquicias)
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Obtener todas las compañías
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de compañías
 */
router.get('/', validateJWT, authorizeRole('SUPER_ADMIN', 'ADMIN_ROLE'), getCompanies);

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Crear una nueva compañía
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Compañía creada
 */
router.post('/', validateJWT, authorizeRole('SUPER_ADMIN', 'ADMIN_ROLE'), createCompany);

export default router;
