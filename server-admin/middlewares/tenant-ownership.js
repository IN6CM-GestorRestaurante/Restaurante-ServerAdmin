import Company from '../src/companies/company.model.js';
import Branch from '../src/branchs/branch.model.js';

export const requireCompanyOwnership = async (req, res, next) => {
    try {
        const userId = req.usuario?._id; // Usuario autenticado por el token conectado de Postgres/C#
        if (!userId) {
            return res.status(401).json({ success: false, message: "No autorizado. Token requerido." });
        }

        // Buscar qué compañía pertenece al usuario
        const company = await Company.findOne({ owner: userId });
        if (!company) {
            return res.status(403).json({ success: false, message: "No tienes una empresa registrada." });
        }

        // Inyectar Company en request para que los siguientes controllers no la busquen.
        req.companyId = company._id;
        
        // Si el endpoint interactúa sobre una Branch, verificar la jerarquía
        if (req.params.branchId || req.body.branchId) {
            const branchId = req.params.branchId || req.body.branchId;
            const branch = await Branch.findOne({ _id: branchId, companyId: company._id });
            
            if (!branch) {
                return res.status(403).json({ success: false, message: "Esta sucursal no pertenece a tu empresa." });
            }
        }
        
        next();
    } catch (error) {
        next(error);
    }
};
