'use strict';

import {Router} from "express";
import {changeTableStatus, createTable, getTableById, getTables, updateTable} from "./table.controller.js";

import {
    validateCreateTable,
    validateGetTableById,
    validateTableStatusChange,
    validateUpdateTable
} from "../../middlewares/tables-validators.js";

const router = Router();

//GET
router.get('/', getTables);
router.get('/:id', validateGetTableById, getTableById);

//POST
router.post('/', validateCreateTable, createTable);

//PUT
router.put('/:id', validateUpdateTable, updateTable);
router.put('/:id/activate', validateTableStatusChange, changeTableStatus);
router.put('/:id/desactivate', validateTableStatusChange, changeTableStatus);

export default router;