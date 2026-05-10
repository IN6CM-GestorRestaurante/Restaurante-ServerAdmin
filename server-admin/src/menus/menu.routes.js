'use strict';

import { Router } from "express";
import { 
    changeMenuStatus, 
    createMenu, 
    getMenuById, 
    getMenus, 
    updateMenu 
} from "./menu.controller.js";
import {
    validateCreateMenu,
    validateGetMenuById,
    validateMenuStatusChange,
    validateUpdateMenu
} from "../../middlewares/menus-validators.js";
import { validateJWT, authorizeRole } from '../../middlewares/auth.middleware.js';
import { injectTenantContext } from '../../middlewares/tenant.middleware.js';
import { verifyResourceOwnership } from '../../middlewares/tenant-ownership.js';
import { uploadMenuImage } from "../../middlewares/file-uploader.js";
import Menu from "./menu.model.js";

const router = Router();
const auth = [validateJWT, injectTenantContext];

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Gestión de carta/menú con aislamiento de Tenant
 */

router.get('/', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'WAITER'), 
    getMenus
);

router.get('/:id', 
    ...auth, 
    validateGetMenuById, 
    verifyResourceOwnership(Menu), 
    getMenuById
);

router.post('/', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    uploadMenuImage.single('image'), 
    validateCreateMenu, 
    createMenu
);

router.put('/:id', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    verifyResourceOwnership(Menu), 
    uploadMenuImage.single('image'), 
    validateUpdateMenu, 
    updateMenu
);

router.put('/:id/activate', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    verifyResourceOwnership(Menu), 
    validateMenuStatusChange, 
    changeMenuStatus
);

router.put('/:id/desactivate', 
    ...auth, 
    authorizeRole('COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    verifyResourceOwnership(Menu), 
    validateMenuStatusChange, 
    changeMenuStatus
);

export default router;