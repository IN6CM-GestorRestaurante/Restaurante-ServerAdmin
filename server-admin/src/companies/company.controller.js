import axios from 'axios';
import Company from './company.model.js';
import { uploadLogoFromBuffer } from './company.cloudinary.js';
import { cloudinary } from '../../middlewares/file-uploader.js';
import mongoose from 'mongoose';

/**
 * Registra una nueva empresa y su administrador principal usando el patrón Saga.
 * Coordina la creación en MongoDB y la sincronización con el auth-service (PostgreSQL).
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 * @author SERV-DRV
 */
export const registerCompanyAndUser = async (req, res, next) => {
    let createdCompany = null;
    let uploadedLogoUrl = null;
    let authUserId = null;
    
    try {
        // PASO 1: Subida de logo a Cloudinary (si existe)
        if (req.file) {
            uploadedLogoUrl = await uploadLogoFromBuffer(req.file.buffer, req.file.originalname);
        }

        // PASO 2: Pre-generar el MongoDB companyId para vincular Postgres↔Mongo
        const companyId = new mongoose.Types.ObjectId();

        // PASO 3: Llamar al auth-service (C#) para crear credenciales y disparar email de verificación
        // Enviamos companyMongoId para que PostgreSQL pueda vincular los registros
        const authResponse = await axios.post(
            `${process.env.AUTH_SERVICE_URL}/api/v1/auth/register`,
            { 
                email: req.body.email, 
                password: req.body.password,
                username: req.body.username || req.body.email.split('@')[0],
                companyMongoId: companyId.toString(),
                role: 'COMPANY_ADMIN'
            },
            { timeout: 10000 }
        );

        if (!authResponse.data || !authResponse.data.authUserId) {
            throw new Error('AUTH_SERVICE_ERROR: No se recibió el identificador de usuario desde el servicio de autenticación.');
        }

        authUserId = authResponse.data.authUserId; // GUID String proveniente de PostgreSQL

        // PASO 4: Crear Empresa en MongoDB vinculada al usuario
        createdCompany = await Company.create({
            _id: companyId,
            legalName: req.body.legalName,
            alias: req.body.alias,
            taxId: req.body.taxId,
            sector: req.body.sector,
            companySize: req.body.companySize,
            country: req.body.country,
            timezone: req.body.timezone || 'America/Guatemala',
            currency: req.body.currency || 'GTQ',
            subdomain: req.body.subdomain,
            logo: uploadedLogoUrl || 'companies/default_logo',
            owner: authUserId.toString()
        });

        return res.status(201).json({
            success: true,
            message: 'Empresa registrada exitosamente. Revisa tu correo electrónico para verificar tu cuenta y comenzar.',
            data: {
                company: createdCompany,
                user: {
                    uid: authUserId,
                    email: req.body.email,
                    role: 'COMPANY_ADMIN'
                }
            }
        });

    } catch (error) {
        // === COMPENSACIÓN (Saga Rollback) ===
        // Si algo falla, debemos limpiar lo que hayamos creado para mantener consistencia
        console.error('Registration saga failed:', error.message);

        if (createdCompany) {
            await Company.findByIdAndDelete(createdCompany._id).catch(err => console.error('Rollback Error (Company):', err));
        }

        if (uploadedLogoUrl && !uploadedLogoUrl.includes('default_logo')) {
            // Extraer public_id para borrar de Cloudinary
            const parts = uploadedLogoUrl.split('/');
            const fileName = parts[parts.length - 1];
            const publicId = fileName.split('.')[0];
            await cloudinary.uploader.destroy(`companies/${publicId}`).catch(err => console.error('Rollback Error (Cloudinary):', err));
        }

        // Si el error proviene del servicio de autenticación
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: error.response.data.message || 'Error en el servicio de autenticación remoto'
            });
        }

        next(error);
    }
};

/**
 * Obtiene el listado de empresas registradas (Solo Admin).
 */
export const getCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find({ isActive: true });
        res.status(200).json({ success: true, data: companies });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene los detalles de una empresa por su ID.
 */
export const getCompanyById = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
        res.status(200).json({ success: true, data: company });
    } catch (error) {
        next(error);
    }
};
