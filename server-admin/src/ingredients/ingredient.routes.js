'use strict';

import { Router } from 'express';
import { 
    getIngredients, 
    getIngredientById, 
    createIngredient, 
    updateIngredient, 
    changeIngredientStatus 
} from './ingredient.controller.js';
import { validateJWT, authorizeRole } from '../../middlewares/auth.middleware.js';
import { injectTenantContext } from '../../middlewares/tenant.middleware.js';
import { verifyResourceOwnership } from '../../middlewares/tenant-ownership.js';
import Ingredient from './ingredient.model.js';

const router = Router();
const auth = [validateJWT, injectTenantContext];

/**
 * @swagger
 * tags:
 *   name: Ingredients
 *   description: Gestión del catálogo de ingredientes con aislamiento de Tenant
 */

router.get('/', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    getIngredients
);

router.get('/:id', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'), 
    verifyResourceOwnership(Ingredient), 
    getIngredientById
);

router.post('/', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN'), 
    createIngredient
);

router.put('/:id', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN'), 
    verifyResourceOwnership(Ingredient), 
    updateIngredient
);

router.put('/:id/activate', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN'), 
    verifyResourceOwnership(Ingredient), 
    changeIngredientStatus
);

router.put('/:id/desactivate', 
    ...auth, 
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN'), 
    verifyResourceOwnership(Ingredient), 
    changeIngredientStatus
);

export default router;
