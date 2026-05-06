import { Router } from "express";
import { checkoutOrder, getInvoicesByBranch } from "./invoice.controller.js";
import { validateJWT, authorizeRole, checkOwnership } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Gestión de facturación, checkout e inmutabilidad contable (ERP)
 */

/**
 * @swagger
 * /invoices/checkout/{orderId}:
 *   post:
 *     summary: Cierra una orden, libera las mesas y emite la factura legal inmutable
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CARD, TRANSFER]
 *     responses:
 *       201:
 *         description: Factura generada y orden cerrada
 *       400:
 *         description: Orden ya pagada o cancelada
 */
router.post("/checkout/:orderId", validateJWT, authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER', 'RECEPTIONIST'), checkoutOrder);

/**
 * @swagger
 * /invoices/branch/{branchId}:
 *   get:
 *     summary: Obtiene la sábana de facturas de una sucursal específica
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sábana devuelta
 */
router.get("/branch/:branchId", validateJWT, authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), checkOwnership('BRANCH'), getInvoicesByBranch);

export default router;
