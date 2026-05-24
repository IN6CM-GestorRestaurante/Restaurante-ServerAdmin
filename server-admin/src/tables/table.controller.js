'use strict';

import mongoose from 'mongoose';
import Table from './table.model.js';

/**
 * Listar mesas filtradas por el contexto del tenant (Sucursal o Empresa).
 */
export const getTables = async (req, res, next) => {
    try {
        const filter = { ...req.tenantFilter, isActive: true };
        
        if (req.query.branch) filter.branch = req.query.branch;
        if (req.query.status) filter.status = req.query.status;

        const tables = await Table.find(filter)
            .populate('branch', 'name')
            .sort({ number: 1 });

        res.status(200).json({
            success: true,
            total: tables.length,
            data: tables
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener detalle de una mesa.
 */
export const getTableById = async (req, res, next) => {
    try {
        const table = req.resource || await Table.findOne({ _id: req.params.id, ...req.tenantFilter });
        
        if (!table) {
            return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
        }

        res.status(200).json({ success: true, data: table });
    } catch (error) {
        next(error);
    }
};

/**
 * Registrar nueva mesa vinculada al tenant.
 */
export const createTable = async (req, res, next) => {
    try {
        const tableData = { 
            ...req.body, 
            companyId: req.companyId 
        };

        const table = new Table(tableData);
        await table.save();

        res.status(201).json({
            success: true,
            message: 'Mesa registrada exitosamente',
            data: table
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar datos de la mesa.
 */
export const updateTable = async (req, res, next) => {
    try {
        const { id } = req.params;
        const table = await Table.findByIdAndUpdate(id, req.body, { returnDocument: 'after', runValidators: true });

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada correctamente',
            data: table
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar (Soft Delete) o Activar mesa del inventario.
 */
export const changeTableStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        
        const table = await Table.findByIdAndUpdate(id, { isActive }, { returnDocument: 'after' });

        res.status(200).json({
            success: true,
            message: `Mesa ${isActive ? 'activada' : 'desactivada'} exitosamente`,
            data: table
        });
    } catch (error) {
        next(error);
    }
};