import { Router } from "express";
import { createOrder, updateItemStatus, updateOrderStatus, getActiveOrdersByBranch } from "./order.controller.js";
import { createOrderValidator, updateItemStatusValidator, updateOrderStatusValidator } from "../../middlewares/orders-validators.js";
import { validateJWT, authorizeRole, checkOwnership } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API para gestión de comandas y estado de pedidos. Integra Mongoose Transactions para control de stock.
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crea una nueva comanda vinculada a una mesa y un mesero
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tables:
 *                 type: array
 *                 items:
 *                   type: string
 *               branch:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItem:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     modifiers:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 */
router.post("/", validateJWT, authorizeRole('WAITRESS', 'WAITER', 'BRANCH_MANAGER'), createOrderValidator, createOrder);

/**
 * @swagger
 * /orders/branch/{branchId}:
 *   get:
 *     summary: Ver rdenes activas de la sucursal
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: rdenes activas
 */
router.get("/branch/:branchId", validateJWT, authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER', 'WAITER', 'RECEPTIONIST'), checkOwnership('BRANCH'), getActiveOrdersByBranch);

/**
 * @swagger
 * /orders/{orderId}/item/{itemId}/status:
 *   patch:
 *     summary: Actualiza el estado de un platillo individual y descuenta de Stock si es 'in-kitchen'
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-kitchen, ready, delivered, paid, cancelled]
 *     responses:
 *       200:
 *         description: Platillo actualizado
 */
router.patch("/:orderId/item/:itemId/status", validateJWT, authorizeRole('WAITRESS', 'WAITER', 'BRANCH_MANAGER'), updateItemStatusValidator, updateItemStatus);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Actualiza el estado general de la orden
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-kitchen, ready, delivered, paid, cancelled]
 *     responses:
 *       200:
 *         description: Estado general actualizado
 */
router.patch("/:id/status", validateJWT, authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), updateOrderStatusValidator, updateOrderStatus);

export default router;