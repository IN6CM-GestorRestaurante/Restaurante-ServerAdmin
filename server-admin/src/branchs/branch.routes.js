'use strict';

import {Router} from "express";
import {
    changeRestaurantStatus,
    createRestaurant,
    getRestaurantById,
    getRestaurants,
    updateRestaurant
} from "./restaurant.controller.js";

import {
    validateCreateRestaurant,
    validateGetRestaurantById,
    validateRestaurantStatusChange,
    validateUpdateRestaurant
} from "../../middlewares/restaurants-validators.js";

import {uploadRestaurantImage} from "../../middlewares/file-uploader.js";

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
router.get('/', getRestaurants);

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
router.get('/:id', validateGetRestaurantById, getRestaurantById);

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
router.post('/', uploadRestaurantImage.single('photos'), validateCreateRestaurant, createRestaurant);

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
router.put('/:id', uploadRestaurantImage.single('photos'), validateUpdateRestaurant, updateRestaurant);

//PUT
router.put('/:id/activate', validateRestaurantStatusChange, changeRestaurantStatus);
router.put('/:id/desactivate', validateRestaurantStatusChange, changeRestaurantStatus);

export default router;