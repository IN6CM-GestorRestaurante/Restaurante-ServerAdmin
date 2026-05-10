import { Router } from "express";
import { 
    createDraftFromOrder, 
    commitInvoice, 
    voidInvoice, 
    getInvoices, 
    getInvoiceById 
} from "./invoice.controller.js";
import { validateJWT, authorizeRole } from "../../middlewares/auth.middleware.js";
import { injectTenantContext } from "../../middlewares/tenant.middleware.js";
import { verifyResourceOwnership } from "../../middlewares/tenant-ownership.js";
import Invoice from "./invoice.model.js";

const router = Router();

// Middlewares globales de seguridad para todo el módulo de facturación
router.use(validateJWT);
router.use(injectTenantContext);
router.use(authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER', 'CASHIER'));

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Gestión del ciclo de vida de Facturas y Notas de Crédito
 */

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Lista facturas aplicando el filtro automático del tenant
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', getInvoices);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Obtiene detalles profundos de una factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', verifyResourceOwnership(Invoice), getInvoiceById);

/**
 * @swagger
 * /invoices/from-order/{orderId}:
 *   post:
 *     summary: Genera un borrador de factura (DRAFT) congelando los ítems de la orden actual
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 */
router.post('/from-order/:orderId', createDraftFromOrder);

/**
 * @swagger
 * /invoices/{id}/commit:
 *   put:
 *     summary: Confirma una factura DRAFT, volviéndola inmutable y cerrando la orden
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/commit', verifyResourceOwnership(Invoice), commitInvoice);

/**
 * @swagger
 * /invoices/{id}/void:
 *   put:
 *     summary: Anula una factura COMMITTED generando su respectiva Nota de Crédito
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/void', verifyResourceOwnership(Invoice), voidInvoice);

export default router;
