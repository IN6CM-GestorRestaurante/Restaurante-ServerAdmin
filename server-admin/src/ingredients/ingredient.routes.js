import { Router } from 'express';
import { getIngredients, createIngredient } from './ingredient.controller.js';
import { validateJWT, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Ingredients
 *   description: Gestión del catálogo global de Ingredientes
 */

/**
 * @swagger
 * /ingredients:
 *   get:
 *     summary: Listar ingredientes
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista devuelta
 */
router.get('/', validateJWT, authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), getIngredients);

/**
 * @swagger
 * /ingredients:
 *   post:
 *     summary: Crear ingrediente
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Creado
 */
router.post('/', validateJWT, authorizeRole('COMPANY_ADMIN'), createIngredient);

export default router;
