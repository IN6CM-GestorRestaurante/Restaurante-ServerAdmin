import axios from 'axios';
import User from '../users/user.model.js';
import Company from './company.model.js';
import { uploadLogoFromBuffer } from './company.cloudinary.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

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
    let createdUser = null;
    let createdCompany = null;
    let uploadedLogoUrl = null;
    
    try {
        // PASO 1: Subida de logo a Cloudinary (si existe)
        if (req.file) {
            uploadedLogoUrl = await uploadLogoFromBuffer(req.file.buffer, req.file.originalname);
        }

        // PASO 2: Crear Perfil de Usuario en MongoDB (sin companyId aún — se asigna en PASO 4)
        // Nota: Desactivamos validación porque companyId es required para COMPANY_ADMIN,
        // pero la Company no existe todavía. Se valida al guardar en PASO 4.
        createdUser = new User({
            name: req.body.name,
            surname: req.body.surname,
            username: req.body.username || req.body.email.split('@')[0],
            email: req.body.email,
            phone: req.body.phone,
            role: 'COMPANY_ADMIN',
            status: false 
        });
        await createdUser.save({ validateBeforeSave: false });

        // PASO 3: Crear Empresa en MongoDB vinculada al usuario
        createdCompany = await Company.create({
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
            owner: createdUser._id
        });

        // PASO 4: Vincular Usuario con el ID de la empresa creada (ahora sí pasa validación)
        createdUser.companyId = createdCompany._id;
        await createdUser.save(); // Validación completa aquí

        // PASO 5: Llamar al auth-service (C#) para crear credenciales y disparar email de verificación
        // Enviamos mongoId y companyMongoId para que PostgreSQL pueda vincular los registros
        const authResponse = await axios.post(
            `${process.env.AUTH_SERVICE_URL}/api/v1/auth/register`,
            { 
                email: req.body.email, 
                password: req.body.password,
                username: createdUser.username,
                mongoId: createdUser._id.toString(),
                companyMongoId: createdCompany._id.toString()
            },
            { timeout: 10000 }
        );

        // PASO 6: Activar usuario tras registro exitoso en auth-service
        // El usuario se creó con status:false para evitar acceso parcial si el Saga fallaba.
        // Ahora que TODO el flujo completó, lo activamos.
        createdUser.status = true;
        if (authResponse.data?.authUserId) {
            createdUser.authId = authResponse.data.authUserId;
        }
        await createdUser.save();

        return res.status(201).json({
            success: true,
            message: 'Empresa registrada exitosamente. Revisa tu correo electrónico para verificar tu cuenta y comenzar.',
            data: {
                company: createdCompany,
                user: {
                    uid: createdUser._id,
                    email: createdUser.email,
                    role: createdUser.role
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

        if (createdUser) {
            await User.findByIdAndDelete(createdUser._id).catch(err => console.error('Rollback Error (User):', err));
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
        const companies = await Company.find({ isActive: true }).populate('owner', 'name surname email');
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
        const company = await Company.findById(req.params.id).populate('owner');
        if (!company) return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
        res.status(200).json({ success: true, data: company });
    } catch (error) {
        next(error);
    }
};
