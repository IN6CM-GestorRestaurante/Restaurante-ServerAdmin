/**
 * Middleware que auto-inyecta branchId, waiterId y companyId en req.body
 * a partir del perfil del usuario autenticado (req.user).
 * 
 * Debe ejecutarse DESPUÉS de validateJWT + injectTenantContext.
 * 
 * Lógica:
 * - Roles operativos (BRANCH_MANAGER, WAITER, CHEF, CASHIER, RECEPTIONIST):
 *   → Se inyectan branch, waiter y companyId automáticamente desde su perfil.
 *   → Si no tienen branchId asignado, se retorna 403.
 * 
 * - COMPANY_ADMIN:
 *   → Se inyecta companyId automáticamente.
 *   → DEBE enviar `branch` en el body (él elige en cuál sucursal opera).
 *   → Si no envía branch, se retorna 400.
 * 
 * - SUPER_ADMIN: bypass total.
 */
export const injectOperationalContext = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ success: false, message: 'Autenticación requerida.' });
    }

    // Siempre registrar quién hace la acción
    req.body._actorId = user._id;

    const branchBoundRoles = ['BRANCH_MANAGER', 'WAITER', 'CHEF', 'CASHIER', 'RECEPTIONIST'];

    if (user.role === 'SUPER_ADMIN') {
        return next(); // Bypass total
    }

    if (branchBoundRoles.includes(user.role)) {
        if (!user.branchId) {
            return res.status(403).json({
                success: false,
                message: 'Tu usuario no tiene una sucursal asignada. Contacta a tu administrador.'
            });
        }
        req.body.branch = user.branchId;
        req.body.waiter = user._id;
        req.body.companyId = user.companyId;
    } else if (user.role === 'COMPANY_ADMIN') {
        req.body.companyId = user.companyId;
        
        if (!req.body.branch) {
            return res.status(400).json({
                success: false,
                message: 'Como administrador, debes especificar la sucursal (branch) para esta operación.'
            });
        }
    }

    next();
};
