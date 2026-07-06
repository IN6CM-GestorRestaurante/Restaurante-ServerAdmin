export const errorHandlerGlobal = (err, req, res, next) => {
    console.error(`[Global Error] ${err.message}`);

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'campo';
        const fieldMap = {
            name: 'nombre',
            email: 'correo electrónico',
            phoneNumber: 'número de teléfono',
            username: 'nombre de usuario'
        };
        const friendlyField = fieldMap[field] || field;
        const msg = `El ${friendlyField} ingresado ya está registrado en el sistema.`;
        return res.status(400).json({
            success: false,
            message: msg,
            errors: [{ field, message: msg }]
        });
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `El valor proporcionado para el campo ${err.path} no es válido.`
        });
    }

    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV !== 'production';
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(isDevelopment && { stack: err.stack })
    });
};