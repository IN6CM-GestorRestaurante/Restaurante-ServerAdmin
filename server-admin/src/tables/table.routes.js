'use strict';

import { Router } from "express";
import { 
    changeTableStatus, 
    createTable, 
    getTableById, 
    getTables, 
    updateTable 
} from "./table.controller.js";
import {
    validateCreateTable,
    validateGetTableById,
    validateTableStatusChange,
    validateUpdateTable
} from "../../middlewares/tables-validators.js";
import { validateJWT, authorizeRole } from '../../middlewares/auth.middleware.js';
import { injectTenantContext } from '../../middlewares/tenant.middleware.js';
import { verifyResourceOwnership } from '../../middlewares/tenant-ownership.js';
import Table from "./table.model.js";

const router = Router();
const auth = [validateJWT, injectTenantContext];

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Gestión de mesas con aislamiento de Tenant
 */

router.get('/', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'RECEPTIONIST'), 
    getTables
);

router.get('/:id', 
    ...auth, 
    validateGetTableById, 
    verifyResourceOwnership(Table), 
    getTableById
);

router.post('/', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    validateCreateTable, 
    createTable
);

router.put('/:id', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    verifyResourceOwnership(Table), 
    validateUpdateTable, 
    updateTable
);

router.put('/:id/activate', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    verifyResourceOwnership(Table), 
    validateTableStatusChange, 
    changeTableStatus
);

router.put('/:id/desactivate', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    verifyResourceOwnership(Table), 
    validateTableStatusChange, 
    changeTableStatus
);

export default router;