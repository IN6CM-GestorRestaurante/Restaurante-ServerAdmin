'use strict';

import {Router} from "express";
import {
    changeReservationStatus,
    createReservation,
    getReservationById,
    getReservations,
    updateReservation
} from "./reservation.controller.js";

import {
    validateCreateReservation,
    validateGetReservationById,
    validateReservationStatusChange,
    validateUpdateReservation
} from "../../middlewares/reservations-validators.js";

const router = Router();

// GET
router.get('/', getReservations);
router.get('/:id', validateGetReservationById, getReservationById);

// POST
router.post('/', validateCreateReservation, createReservation);

// PUT
router.put('/:id', validateUpdateReservation, updateReservation);
router.put('/:id/activate', validateReservationStatusChange, changeReservationStatus);
router.put('/:id/desactivate', validateReservationStatusChange, changeReservationStatus);

export default router;