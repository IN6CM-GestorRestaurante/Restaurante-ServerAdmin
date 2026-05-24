/**
 * CSRF Enforcement Middleware
 * Intercepts state-changing operations (POST, PUT, PATCH, DELETE) and validates
 * the presence of standard secure custom XHR headers to prevent CSRF attacks.
 */
export default (req, res, next) => {
    // Exclude safe read-only methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const xRequestedWith = req.headers["x-requested-with"];

    if (!xRequestedWith || xRequestedWith.toLowerCase() !== "xmlhttprequest") {
        return res.status(403).json({
            success: false,
            error: "CSRF_BLOCKED",
            message: "Acceso denegado: Solicitud rechazada por protección CSRF. Se requiere el encabezado X-Requested-With."
        });
    }

    next();
};
