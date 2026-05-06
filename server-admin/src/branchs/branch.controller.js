'use strict';

import mongoose from 'mongoose';
import Branch from './branch.model.js';

export const getBranches = async (req, res) => {
    try {
        const {isActive} = req.query;

        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const branches = await Branch.find(filter)
            .sort({createdAt: -1});

        res.status(200).json({
            success: true,
            total: branches.length,
            data: branches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las sucursales',
            error: error.message
        });
    }
};

export const getBranchById = async (req, res) => {
    try {
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de MongoDB no válido'
            });
        }

        const branch = await Branch.findById(id);

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: branch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la sucursal',
            error: error.message
        });
    }
};

export const createBranch = async (req, res) => {
    try {
        const branchData = req.body;

        if (req.file) {
            const extension = req.file.path.split('.').pop();
            const fileName = req.file.filename;

            const relativePath = fileName.substring(
                fileName.indexOf('photos/')
            );

            branchData.photos = [`${relativePath}.${extension}`];
        } else {
            branchData.photos = ['photos/default_photos_logo'];
        }

        const branch = new Branch(branchData);
        await branch.save();

        res.status(201).json({
            succes: true,
            message: 'Sucursal creada exitosamente',
            data: branch
        });

    } catch (error) {
        res.status(500).json({
            succes: false,
            message: 'Error al crear la sucursal',
            error: error.message
        });
    }
};

export const updateBranch = async (req, res) => {
    try {
        const {id} = req.params;
        const updateData = {...req.body};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: 'ID no válido'});
        }

        if (req.file) {
            const extension = req.file.path.split('.').pop();
            const fileName = req.file.filename;
            const relativePath = fileName.substring(fileName.indexOf('photos/'));
            updateData.photos = [`${relativePath}.${extension}`];
        }

        const branch = await Branch.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Sucursal actualizada exitosamente',
            data: branch
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la sucursal',
            error: error.message
        });
    }
};

export const changeBranchStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activada' : 'desactivada';

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({success: false, message: 'ID no válido'});
        }

        const branch = await Branch.findByIdAndUpdate(
            id,
            {isActive},
            {new: true}
        );

        if (!branch) {
            return res.status(404).json({success: false, message: 'Sucursal no encontrada'});
        }

        res.status(200).json({
            success: true,
            message: `Sucursal ${action} exitosamente`,
            data: branch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado',
            error: error.message
        });
    }
};