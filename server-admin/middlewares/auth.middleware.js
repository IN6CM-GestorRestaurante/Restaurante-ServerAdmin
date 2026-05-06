import jwt from 'jsonwebtoken';
import User from '../src/users/user.model.js';

export const validateJWT = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, message: 'Falta token de acceso' });

        const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        
        let userEmail = decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        let user;

        if (userEmail) {
            user = await User.findOne({email: userEmail});
            if (!user) {
                user = new User({
                    name: "Admin",
                    surname: "Generado",
                    username: userEmail.split('@')[0],
                    email: userEmail,
                    phone: "00000000",
                    role: decoded.role || 'ADMIN_ROLE',
                    status: true
                });
                await user.save();
            }
        } else if (decoded.uid) {
            user = await User.findById(decoded.uid);
        }

        if (!user || !user.status) {
            return res.status(401).json({ success: false, message: 'Usuario no existe o está inactivo' });
        }

        req.user = user;
        req.usuario = user; // Por compatibilidad hacia atrás
        
        // Asignar companyId si es necesario para ownership (tomar la primera si no la tiene)
        next();
    } catch (error) {
        console.log("JWT Error: ", error.message);
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
        if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'COMPANY_ADMIN' || req.user.role === 'ADMIN_ROLE') return next();

        const requestedCompanyId = req.body.companyId || req.params.companyId;
        const requestedBranchId = req.body.branchId || req.params.branchId || req.body.branch;

        if (resourceType === 'COMPANY' && requestedCompanyId) {
            if (req.user.companyId && req.user.companyId.toString() !== requestedCompanyId.toString()) {
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
