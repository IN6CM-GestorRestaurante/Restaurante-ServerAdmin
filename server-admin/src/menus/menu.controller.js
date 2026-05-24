'use strict';

import mongoose from 'mongoose';
import Menu from './menu.model.js';

/**
 * Listar platillos del menú filtrados por tenant.
 */
export const getMenus = async (req, res, next) => {
    try {
        const filter = { ...req.tenantFilter, isActive: true };
        
        // Filtros adicionales por query
        if (req.query.branch) filter.branch = req.query.branch;
        if (req.query.category) filter.category = req.query.category;

        const menus = await Menu.find(filter)
            .populate('branch', 'name')
            .sort({ category: 1, name: 1 });

        res.status(200).json({
            success: true,
            total: menus.length,
            data: menus
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener detalle de un plato.
 */
export const getMenuById = async (req, res, next) => {
    try {
        const menu = req.resource || await Menu.findOne({ _id: req.params.id, ...req.tenantFilter });
        
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Plato no encontrado' });
        }

        res.status(200).json({ success: true, data: menu });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear nuevo plato en el menú vinculado al tenant.
 */
export const createMenu = async (req, res, next) => {
    try {
        const menuData = { 
            ...req.body, 
            companyId: req.companyId 
        };

        if (req.file) {
            menuData.image = req.file.path; // Cloudinary URL
        }

        const menu = new Menu(menuData);
        await menu.save();

        res.status(201).json({
            success: true,
            message: 'Plato creado exitosamente',
            data: menu
        });
    } catch (error) {
        next(error);
    }
};

export const updateMenu = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (req.file) {
            updateData.image = req.file.path;
        } else if (req.body.removeImage === "true") {
            updateData.image = 'menus/default_menu';
        }

        const menu = await Menu.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });

        res.status(200).json({
            success: true,
            message: 'Plato actualizado exitosamente',
            data: menu
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cambiar estado del plato (Soft Delete).
 */
export const changeMenuStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        
        const menu = await Menu.findByIdAndUpdate(id, { isActive }, { returnDocument: 'after' });

        res.status(200).json({
            success: true,
            message: `Plato ${isActive ? 'activado' : 'desactivado'} exitosamente`,
            data: menu
        });
    } catch (error) {
        next(error);
    }
};