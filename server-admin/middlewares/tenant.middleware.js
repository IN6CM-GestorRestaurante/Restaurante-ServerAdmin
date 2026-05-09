/**
 * Middleware para inyectar el contexto de Tenant en la petición.
 * Facilita el aislamiento de datos (Multitenancy) en consultas posteriores.
 * Debe ejecutarse DESPUÉS de validateJWT.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 * @author SERV-DRV
 */
export const injectTenantContext = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ success: false, message: 'Autenticación requerida para acceder al contexto de tenant.' });
    }

    // El SUPER_ADMIN tiene visibilidad global (filtro vacío)
    if (user.role === 'SUPER_ADMIN') {
        req.tenantFilter = {};
        req.isSuperAdmin = true;
        return next();
    }

    // El COMPANY_ADMIN ve todos los recursos de su organización
    if (user.role === 'COMPANY_ADMIN') {
        if (!user.companyId) {
            return res.status(403).json({ success: false, message: 'No tienes una empresa asignada en tu perfil.' });
        }
        req.tenantFilter = { companyId: user.companyId };
        req.companyId = user.companyId;
        return next();
    }

    // Roles operativos (BRANCH_MANAGER, WAITER, etc.) ven solo lo de su sucursal
    if (!user.companyId || !user.branchId) {
        return res.status(403).json({ success: false, message: 'No tienes una empresa o sucursal asignada en tu perfil.' });
    }

    req.tenantFilter = { companyId: user.companyId, branchId: user.branchId };
    req.companyId = user.companyId;
    req.branchId = user.branchId;

    next();
};
