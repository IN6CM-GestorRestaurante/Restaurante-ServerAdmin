import {validationResult} from 'express-validator';

export const checkValidators = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorArray = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            path: error.path || error.param,
            param: error.path || error.param,
            msg: error.msg
        }));
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            error: errorArray,
            errors: errorArray,
        });
    }
    next();
}