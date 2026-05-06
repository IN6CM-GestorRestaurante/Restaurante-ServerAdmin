import jwt from 'jsonwebtoken';
import User from '../src/users/user.model.js';

export const validateJWT = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, message: 'Falta token de acceso' });

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const user = await User.findById(uid);
        
        if (!user || !user.status) {
            return res.status(401).json({ success: false, message: 'Usuario no existe o está inactivo' });
        }

        req.user = user;
        req.usuario = user; // Por compatibilidad hacia atrás
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token no válido' });
    }
};

export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({ success: false, message: 'Se intentó verificar el rol sin validar el token' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Acceso denegado. Se requiere uno de los roles: ${allowedRoles.join(', ')}` 
            });
        }
        next();
    };
};

export const checkOwnership = (resourceType) => {
    return (req, res, next) => {
        if (req.user.role === 'SUPER_ADMIN') return next();

        const requestedCompanyId = req.body.companyId || req.params.companyId;
        const requestedBranchId = req.body.branchId || req.params.branchId || req.body.branch;

        if (resourceType === 'COMPANY' && requestedCompanyId) {
            if (req.user.companyId.toString() !== requestedCompanyId.toString()) {
                return res.status(403).json({ success: false, message: "No tienes permiso sobre esta empresa." });
            }
        }

        if (resourceType === 'BRANCH' && requestedBranchId) {
            if (req.user.branchId && req.user.branchId.toString() !== requestedBranchId.toString()) {
                return res.status(403).json({ success: false, message: "No tienes permiso sobre esta sucursal." });
            }
        }
        next();
    };
};
