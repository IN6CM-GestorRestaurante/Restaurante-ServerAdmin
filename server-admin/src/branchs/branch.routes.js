'use strict';

import {Router} from "express";
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

import {uploadBranchImage} from "../../middlewares/file-uploader.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Gestión de sucursales (Branches).
 */

/**
 * @swagger
 * /branches:
 *   get:
 *     summary: Obtiene la lista de todas las sucursales
 *     tags: [Branches]
 *     responses:
 *       200:
 *         description: Lista devuelta
 */
router.get('/', validateJWT, getBranches);

/**
 * @swagger
 * /branches/{id}:
 *   get:
 *     summary: Obtiene una sucursal por su ID
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sucursal obtenida
 */
router.get('/:id', validateJWT, validateGetBranchById, getBranchById);

/**
 * @swagger
 * /branches:
 *   post:
 *     summary: Crea una nueva sucursal dependiente de un Company
 *     tags: [Branches]
 *     responses:
 *       201:
 *         description: Sucursal creada
 */
router.post('/', validateJWT, authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'ADMIN_ROLE'), uploadBranchImage.single('photos'), validateCreateBranch, createBranch);

/**
 * @swagger
 * /branches/{id}:
 *   put:
 *     summary: Actualiza una sucursal
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sucursal actualizada
 */
router.put('/:id', validateJWT, authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'ADMIN_ROLE'), uploadBranchImage.single('photos'), validateUpdateBranch, updateBranch);

//PUT
router.put('/:id/activate', validateJWT, authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'ADMIN_ROLE'), validateBranchStatusChange, changeBranchStatus);
router.put('/:id/desactivate', validateJWT, authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'ADMIN_ROLE'), validateBranchStatusChange, changeBranchStatus);

export default router;