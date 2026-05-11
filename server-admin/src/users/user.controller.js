import mongoose from 'mongoose';
import axios from 'axios';
import User from './user.model.js';
import Branch from '../branchs/branch.model.js';

/**
 * Obtiene el listado de empleados de la empresa o sucursal.
 * Aplica filtros de tenant automáticamente (COMPANY_ADMIN ve toda la empresa, BRANCH_MANAGER su sucursal).
 */
export const getUsers = async (req, res, next) => {
    try {
        const { role, branchId, status } = req.query;
        
        // El tenantFilter inyecta companyId (y branchId si es BRANCH_MANAGER o rol operativo)
        const query = { ...req.tenantFilter };
        
        // Filtros opcionales por query params
        if (role) query.role = role;
        if (branchId) query.branchId = branchId;
        if (status !== undefined) query.status = status === 'true';

        const users = await User.find(query)
            .populate('companyId', 'legalName alias')
            .populate('branchId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el detalle de un usuario específico.
 */
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await User.findOne({ _id: id, ...req.tenantFilter })
            .populate('companyId', 'legalName')
            .populate('branchId', 'name address');

        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado o no pertenece a tu organización' });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el perfil del usuario autenticado actual.
 */
export const getProfile = async (req, res, next) => {
    try {
        // req.user viene inyectado del middleware validateJWT
        const user = await User.findById(req.user._id)
            .populate('companyId', 'legalName')
            .populate('branchId', 'name');
            
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

/**
 * Crea un empleado en la organización del COMPANY_ADMIN.
 * No genera credenciales de login (esto se delega al auth-service en una futura fase si se requiere).
 */
export const createUser = async (req, res, next) => {
    try {
        const { name, surname, email, phone, username, role, branchId } = req.body;

        const allowedRoles = ['BRANCH_MANAGER', 'WAITER', 'CHEF', 'CASHIER', 'RECEPTIONIST'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ success: false, message: `Rol inválido. Roles permitidos: ${allowedRoles.join(', ')}` });
        }

        // Validar que la sucursal asignada pertenece a la empresa del COMPANY_ADMIN
        if (branchId) {
            const branch = await Branch.findOne({ _id: branchId, companyId: req.companyId });
            if (!branch) {
                return res.status(400).json({ success: false, message: 'La sucursal indicada no existe o no pertenece a tu empresa' });
            }
        }

        const newUser = new User({
            name,
            surname,
            email,
            phone,
            username: username || email.split('@')[0],
            role,
            branchId,
            companyId: req.companyId, // Inyectado por el middleware de Tenant
            status: false // Se activa después de crear credenciales
        });

        await newUser.save();

        // Crear credenciales en auth-service (C#)
        const authResponse = await axios.post(
            `${process.env.AUTH_SERVICE_URL}/api/v1/auth/register`,
            { 
                email: newUser.email, 
                password: "Password123!", // Contraseña por defecto para empleados
                username: newUser.username,
                mongoId: newUser._id.toString(),
                companyMongoId: req.companyId.toString(),
                role: newUser.role
            },
            { timeout: 10000 }
        );

        newUser.status = true;
        if (authResponse.data?.authUserId) {
            newUser.authId = authResponse.data.authUserId;
        }
        await newUser.save();

        res.status(201).json({ success: true, message: 'Empleado creado con éxito (Password default: Password123!)', data: newUser });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualiza los datos de perfil de un empleado.
 * El correo (email) no se puede cambiar ya que es el identificador principal.
 */
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, surname, phone, role, branchId } = req.body;

        // Validar propiedad del usuario a modificar (Aislamiento de Tenant)
        const existingUser = await User.findOne({ _id: id, ...req.tenantFilter });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        if (branchId) {
            const branch = await Branch.findOne({ _id: branchId, companyId: req.companyId });
            if (!branch) return res.status(400).json({ success: false, message: 'Sucursal inválida' });
        }

        existingUser.name = name || existingUser.name;
        existingUser.surname = surname || existingUser.surname;
        existingUser.phone = phone || existingUser.phone;
        existingUser.role = role || existingUser.role;
        existingUser.branchId = branchId || existingUser.branchId;

        await existingUser.save();

        res.status(200).json({ success: true, message: 'Empleado actualizado', data: existingUser });
    } catch (error) {
        next(error);
    }
};

/**
 * Activa o desactiva (soft delete) a un usuario.
 */
export const changeUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        
        const existingUser = await User.findOne({ _id: id, ...req.tenantFilter });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }

        existingUser.status = isActive;
        await existingUser.save();

        res.status(200).json({ 
            success: true, 
            message: `Empleado ${isActive ? 'activado' : 'desactivado'} con éxito`, 
            data: existingUser 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint interno para sincronización con auth-service (C#).
 * Busca un usuario por email y actualiza su rol u otros campos si es necesario.
 * No crea usuarios nuevos automáticamente por seguridad.
 */
export const syncProfile = async (req, res, next) => {
    try {
        const { email, role } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email es requerido para sincronizar' });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            // Si el usuario no existe en Mongo, no lo creamos.
            // Debe haber sido creado por el flujo Saga de registro (Company) o como Empleado.
            return res.status(200).json({ 
                success: true, 
                message: 'Usuario no encontrado en base de datos local. Sincronización ignorada.' 
            });
        }

        if (role) {
            user.role = role;
            await user.save();
        }

        res.status(200).json({ success: true, message: 'Perfil sincronizado correctamente', data: user });
    } catch (error) {
        console.error("Error al sincronizar perfil:", error);
        next(error);
    }
};