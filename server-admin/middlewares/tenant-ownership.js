import mongoose from 'mongoose';

/**
 * Verifica que un recurso específico pertenezca al tenant del usuario autenticado.
 * Ideal para proteger rutas con parámetros de ID (GET/:id, PUT/:id, DELETE/:id).
 * 
 * @param {mongoose.Model} Model - El modelo Mongoose del recurso a verificar.
 * @param {string} paramName - El nombre del parámetro en req.params que contiene el ID.
 * @author Antigravity
 */
export const verifyResourceOwnership = (Model, paramName = 'id') => {
    return async (req, res, next) => {
        // Los administradores globales saltan esta validación
        if (req.isSuperAdmin) return next();

        try {
            const resourceId = req.params[paramName];
            
            // Usamos .lean() para mayor rendimiento ya que solo queremos verificar pertenencia
            const resource = await Model.findById(resourceId).lean();

            if (!resource) {
                return res.status(404).json({ success: false, message: 'Recurso no encontrado en el sistema.' });
            }

            // Verificación de pertenencia a la empresa (Company Isolation)
            const resourceCompanyId = resource.companyId?.toString();
            const userCompanyId = req.companyId?.toString();

            if (resourceCompanyId && resourceCompanyId !== userCompanyId) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Acceso denegado. El recurso no pertenece a tu organización.' 
                });
            }

            // Verificación de pertenencia a la sucursal si el usuario es de sucursal
            if (req.branchId) {
                const resourceBranchId = resource.branchId?.toString();
                const userBranchId = req.branchId?.toString();

                if (resourceBranchId && resourceBranchId !== userBranchId) {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'Acceso denegado. El recurso pertenece a otra sucursal de la organización.' 
                    });
                }
            }

            // Inyectamos el recurso en req para evitar que el controller lo vuelva a consultar
            req.resource = resource;
            
            next();
        } catch (error) {
            console.error('Error en validación de propiedad de recurso:', error);
            res.status(500).json({ success: false, message: 'Error interno al validar propiedad del recurso.' });
        }
    };
};
