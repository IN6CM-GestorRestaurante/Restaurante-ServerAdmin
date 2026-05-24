'use strict';

import {Router} from "express";
import {
    changeReservationStatus,
    createReservation,
    getReservationById,
    getReservations,
    updateReservation,
    getSmartTableAllocation,
    findAvailableTablesForParty
} from "./reservation.controller.js";

import {
    validateCreateReservation,
    validateGetReservationById,
    validateReservationStatusChange,
    validateUpdateReservation
} from "../../middlewares/reservations-validators.js";

import { validateJWT, authorizeRole } from '../../middlewares/auth.middleware.js';
import { injectTenantContext } from '../../middlewares/tenant.middleware.js';

const router = Router();
const auth = [validateJWT, injectTenantContext];

// GET
router.get('/',
    ...auth,
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'WAITER', 'WAITRESS', 'RECEPTIONIST'),
    getReservations
);
router.get('/smart-allocation',
    ...auth,
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'WAITER', 'WAITRESS', 'RECEPTIONIST'),
    getSmartTableAllocation
);
router.get('/available-tables',
    ...auth,
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'WAITER', 'WAITRESS', 'RECEPTIONIST'),
    findAvailableTablesForParty
);
router.get('/:id',
    ...auth,
    validateGetReservationById,
    getReservationById
);

// POST
router.post('/',
    ...auth,
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'RECEPTIONIST'),
    validateCreateReservation,
    createReservation
);

// PUT
router.put('/:id',
    ...auth,
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER', 'RECEPTIONIST'),
    validateUpdateReservation,
    updateReservation
);
router.put('/:id/activate',
    ...auth,
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'),
    validateReservationStatusChange,
    changeReservationStatus
);
router.put('/:id/desactivate',
    ...auth,
    authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'BRANCH_MANAGER'),
    validateReservationStatusChange,
    changeReservationStatus
);

export default router;