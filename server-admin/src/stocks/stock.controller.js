import Stock from './stock.model.js';
import Branch from '../branchs/branch.model.js';

export const getStocks = async (req, res, next) => {
    try {
        let filter = {};
        const companyId = req.companyId || req.user?.companyId;
        const branchId = req.branchId || req.user?.branchId;

        if (req.user?.role === 'COMPANY_ADMIN' && companyId) {
            // Get all branches of the company
            const branches = await Branch.find({ companyId: companyId });
            const branchIds = branches.map(b => b._id);
            filter = { branchId: { $in: branchIds } };
        } else if (req.user?.role !== 'SUPER_ADMIN' && branchId) {
            filter = { branchId: branchId };
        }
        
        const stocks = await Stock.find(filter)
            .populate('ingredientId')
            .populate('branchId', 'name'); // Also populate branch name!
        res.status(200).json({ success: true, data: stocks });
    } catch (error) {
        next(error);
    }
};

export const createOrUpdateStock = async (req, res, next) => {
    try {
        const { ingredientId, quantity, minStock } = req.body;
        const branchId = req.branchId || req.user?.branchId || req.body.branchId;

        const stock = await Stock.findOneAndUpdate(
            { branchId, ingredientId },
            { $set: { quantity, minStock } },
            { returnDocument: 'after', upsert: true }
        ).populate('ingredientId');
        res.status(200).json({ success: true, data: stock });
    } catch (error) {
        next(error);
    }
};
