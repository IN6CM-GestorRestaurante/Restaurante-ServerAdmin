import { Router } from 'express';
import { getStocks, createOrUpdateStock } from './stock.controller.js';
import { validateJWT, authorizeRole, checkOwnership } from '../../middlewares/auth.middleware.js';
import { injectTenantContext } from '../../middlewares/tenant.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stocks
 *   description: Inventario local por sucursal
 */

/**
 * @swagger
 * /stocks:
 *   get:
 *     summary: Obtener inventario
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventario obtenido exitosamente
 */
router.get('/', validateJWT, injectTenantContext, authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), getStocks);

/**
 * @swagger
 * /stocks:
 *   post:
 *     summary: Establecer o actualizar inventario
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventario modificado
 */
router.post('/', validateJWT, injectTenantContext, authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), checkOwnership('BRANCH'), createOrUpdateStock);

export default router;
