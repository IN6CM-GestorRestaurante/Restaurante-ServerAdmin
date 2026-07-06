'use strict';

import { Router } from "express";
import {
    changeBranchStatus,
    createBranch,
    getBranchById,
    getBranches,
    updateBranch
} from "./branch.controller.js";
import {
    validateCreateBranch,
    validateGetBranchById,
    validateBranchStatusChange,
    validateUpdateBranch
} from "../../middlewares/branches-validators.js";
import { validateJWT, authorizeRole } from '../../middlewares/auth.middleware.js';
import { injectTenantContext } from '../../middlewares/tenant.middleware.js';
import { verifyResourceOwnership } from '../../middlewares/tenant-ownership.js';
import { uploadBranchImage } from "../../middlewares/file-uploader.js";
import Branch from "./branch.model.js";

const router = Router();
const auth = [validateJWT, injectTenantContext];

const safeUploadBranchImage = (req, res, next) => {
    uploadBranchImage.single('photos')(req, res, (err) => {
        if (err) {
            console.warn("[Cloudinary Warning] Falla en subida de imagen, continuando sin imagen:", err.message);
            return next();
        }
        next();
    });
};

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Gestión de sucursales con aislamiento de Tenant
 */

router.get('/', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    getBranches
);

router.get('/:id', 
    ...auth, 
    validateGetBranchById, 
    verifyResourceOwnership(Branch), 
    getBranchById
);

router.post('/', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN'), 
    safeUploadBranchImage, 
    validateCreateBranch, 
    createBranch
);

router.put('/:id', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN'), 
    safeUploadBranchImage, 
    verifyResourceOwnership(Branch), 
    validateUpdateBranch, 
    updateBranch
);

router.put('/:id/activate', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN'), 
    verifyResourceOwnership(Branch), 
    validateBranchStatusChange, 
    changeBranchStatus
);

router.put('/:id/desactivate', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN'), 
    verifyResourceOwnership(Branch), 
    validateBranchStatusChange, 
    changeBranchStatus
);

export default router;