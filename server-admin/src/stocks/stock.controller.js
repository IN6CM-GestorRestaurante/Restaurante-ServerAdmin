import Stock from './stock.model.js';

export const getStocks = async (req, res, next) => {
    try {
        const filter = req.user.role === 'SUPER_ADMIN' ? {} : { branchId: req.user.branchId };
        const stocks = await Stock.find(filter).populate('ingredientId');
        res.status(200).json({ success: true, data: stocks });
    } catch (error) {
        next(error);
    }
};

export const createOrUpdateStock = async (req, res, next) => {
    try {
        const { ingredientId, quantity, minStock } = req.body;
        const branchId = req.user.branchId || req.body.branchId;

        const stock = await Stock.findOneAndUpdate(
            { branchId, ingredientId },
            { $set: { quantity, minStock } },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: stock });
    } catch (error) {
        next(error);
    }
};
