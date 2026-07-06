'use strict';

import mongoose from 'mongoose';
import Branch from './branch.model.js';
import Company from '../companies/company.model.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         isActive:
 *           type: boolean
 */

/**
 * Listar sucursales filtradas por el contexto del tenant.
 */
export const getBranches = async (req, res, next) => {
    try {
        // req.tenantFilter es inyectado por injectTenantContext
        const branches = await Branch.find({ ...req.tenantFilter, isActive: true })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: branches.length,
            data: branches
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener detalle de sucursal.
 */
export const getBranchById = async (req, res, next) => {
    try {
        // req.resource es inyectado por verifyResourceOwnership
        const branch = req.resource || await Branch.findOne({ _id: req.params.id, ...req.tenantFilter });
        
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Sucursal no encontrada' });
        }

        res.status(200).json({ success: true, data: branch });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear nueva sucursal vinculada al tenant actual.
 */
export const createBranch = async (req, res, next) => {
    try {
        let companyId = req.companyId || req.body.companyId;
        if (!companyId) {
            const defaultCompany = await Company.findOne({ isActive: true });
            if (defaultCompany) {
                companyId = defaultCompany._id;
            } else {
                const anyCompany = await Company.findOne({});
                if (anyCompany) {
                    companyId = anyCompany._id;
                } else {
                    const newDefaultCompany = await Company.create({
                        legalName: "Empresa Principal S.A.",
                        alias: "Empresa Principal",
                        taxId: "CF-DEFAULT-001",
                        sector: "Restaurante",
                        companySize: "1-10",
                        country: "Guatemala",
                        timezone: "America/Guatemala",
                        currency: "GTQ",
                        subdomain: "empresa-principal",
                        owner: req.user?._id || "00000000-0000-0000-0000-000000000000",
                        isActive: true
                    });
                    companyId = newDefaultCompany._id;
                }
            }
        }
        const branchData = { 
            ...req.body, 
            companyId
        };

        if (req.file) {
            const photoUrl = req.file.path || req.file.secure_url || req.file.url || (typeof req.file === 'string' ? req.file : null);
            if (photoUrl) {
                branchData.photos = [photoUrl];
            } else {
                delete branchData.photos;
            }
        } else if (branchData.photos) {
            if (Array.isArray(branchData.photos)) {
                branchData.photos = branchData.photos.filter(p => typeof p === 'string' && !p.includes('[object'));
                if (branchData.photos.length === 0) delete branchData.photos;
            } else if (typeof branchData.photos !== 'string' || branchData.photos.includes('[object')) {
                delete branchData.photos;
            } else {
                branchData.photos = [branchData.photos];
            }
        }

        const branch = new Branch(branchData);
        await branch.save();

        res.status(201).json({
            success: true,
            message: 'Sucursal creada exitosamente',
            data: branch
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar sucursal.
 */
export const updateBranch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (req.file) {
            const photoUrl = req.file.path || req.file.secure_url || req.file.url || (typeof req.file === 'string' ? req.file : null);
            if (photoUrl) {
                updateData.photos = [photoUrl];
            } else {
                delete updateData.photos;
            }
        } else if (req.body.removePhoto === "true") {
            updateData.photos = ['photos/default_photos_logo'];
        } else if (updateData.photos) {
            if (Array.isArray(updateData.photos)) {
                updateData.photos = updateData.photos.filter(p => typeof p === 'string' && !p.includes('[object'));
                if (updateData.photos.length === 0) delete updateData.photos;
            } else if (typeof updateData.photos !== 'string' || updateData.photos.includes('[object')) {
                delete updateData.photos;
            } else {
                updateData.photos = [updateData.photos];
            }
        }

        const branch = await Branch.findByIdAndUpdate(id, updateData, {
            returnDocument: 'after',
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Sucursal actualizada exitosamente',
            data: branch
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cambiar estado (Activar/Desactivar) - Soft Delete.
 */
export const changeBranchStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        
        const branch = await Branch.findByIdAndUpdate(id, { isActive }, { returnDocument: 'after' });

        res.status(200).json({
            success: true,
            message: `Sucursal ${isActive ? 'activada' : 'desactivada'} exitosamente`,
            data: branch
        });
    } catch (error) {
        next(error);
    }
};