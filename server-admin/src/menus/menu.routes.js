'use strict';

import {Router} from "express";
import {changeMenuStatus, createMenu, getMenuById, getMenus, updateMenu} from "./menu.controller.js";

import {
    validateCreateMenu,
    validateGetMenuById,
    validateMenuStatusChange,
    validateUpdateMenu
} from "../../middlewares/menus-validators.js";

import {uploadMenuImage} from "../../middlewares/file-uploader.js";

const router = Router();

// GET
router.get('/', getMenus);
router.get('/:id', validateGetMenuById, getMenuById);

// POST
router.post('/', uploadMenuImage.single('image'), validateCreateMenu, createMenu);

// PUT
router.put('/:id', uploadMenuImage.single('image'), validateUpdateMenu, updateMenu);
router.put('/:id/activate', validateMenuStatusChange, changeMenuStatus);
router.put('/:id/desactivate', validateMenuStatusChange, changeMenuStatus);

export default router;