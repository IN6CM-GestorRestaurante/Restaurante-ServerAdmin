import Company from './company.model.js';

export const getCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find({ isActive: true });
        res.status(200).json({ success: true, data: companies });
    } catch (error) {
        next(error);
    }
};

export const getCompanyById = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ success: false, message: 'Company no encontrada' });
        res.status(200).json({ success: true, data: company });
    } catch (error) {
        next(error);
    }
};

export const createCompany = async (req, res, next) => {
    try {
        const newCompany = new Company(req.body);
        await newCompany.save();
        res.status(201).json({ success: true, data: newCompany });
    } catch (error) {
        next(error);
    }
};
