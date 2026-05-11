import jwt from 'jsonwebtoken';
import User from '../src/users/user.model.js';

/**
 * Middleware para validar el Token JWT y sincronizar con el usuario de MongoDB.
 * 
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Función para continuar al siguiente middleware.
 */
export const validateJWT = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Falta token de acceso' });
        }

        // El SECRETORPRIVATEKEY debe estar en el .env (es la misma llave que usa C#)
        const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        
        // El JWT de C# puede traer el email en 'email' o en el claim con namespace de SOAP
        const email = decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        
        const role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        
        if (!email) {
            return res.status(401).json({ success: false, message: 'Token inválido: No se encontró el identificador del usuario' });
        }

        // Bypass: El SUPER_ADMIN se origina desde el seeder de C# (PostgreSQL) y no necesita perfil en MongoDB
        if (role === 'SUPER_ADMIN' || role === 'ADMIN_ROLE') {
            req.user = {
                _id: '000000000000000000000000', // Mock ObjectId válido para Mongoose si se requiere
                email: email,
                role: 'SUPER_ADMIN', // Normalizamos para que coincida con authorizeRole('SUPER_ADMIN')
                status: true
            };
            req.usuario = req.user;
            return next();
        }

        // Buscamos al usuario regular en MongoDB por su correo
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Usuario no sincronizado. Completa tu registro." 
            });
        }

        if (user.status === false) {
            return res.status(401).json({ 
                success: false, 
                message: "Usuario desactivado." 
            });
        }

        // Inyectamos el usuario en la petición para uso posterior
        req.user = user;
        req.usuario = user; // Compatibilidad heredada

        next();
    } catch (error) {
        console.error("JWT Error: ", error.message);
        return res.status(401).json({ success: false, message: 'Token no válido o expirado' });
    }
};

/**
 * Middleware para autorizar el acceso basado en roles.
 * 
 * @param {...string} allowedRoles - Lista de roles permitidos.
 */
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

/**
 * Middleware para verificar la propiedad de los recursos (Multitenancy).
 * 
 * @param {string} resourceType - Tipo de recurso ('COMPANY', 'BRANCH', etc).
 */
export const checkOwnership = (resourceType) => {
    return (req, res, next) => {
        const { role, companyId, branchId } = req.user;

        // El SUPER_ADMIN tiene bypass total sobre cualquier recurso
        if (role === 'SUPER_ADMIN') return next();

        const requestedCompanyId = req.body.companyId || req.params.companyId || req.query.companyId;
        const requestedBranchId = req.body.branchId || req.params.branchId || req.query.branchId;

        // Validación para COMPANY_ADMIN: Solo puede ver/editar lo que pertenece a su compañía
        if (role === 'COMPANY_ADMIN') {
            if (requestedCompanyId && companyId?.toString() !== requestedCompanyId.toString()) {
                return res.status(403).json({ success: false, message: "No tienes permiso sobre esta empresa." });
            }
            return next();
        }

        // Validación para BRANCH_MANAGER y otros roles operativos: Solo pueden ver lo de su sucursal
        if (requestedBranchId && branchId?.toString() !== requestedBranchId.toString()) {
            return res.status(403).json({ success: false, message: "No tienes permiso sobre esta sucursal." });
        }

        // Si se pide una compañía específica y no es la suya, denegar
        if (requestedCompanyId && companyId?.toString() !== requestedCompanyId.toString()) {
            return res.status(403).json({ success: false, message: "No tienes permiso sobre esta empresa." });
        }

        next();
    };
};
