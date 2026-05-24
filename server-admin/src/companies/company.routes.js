import { Router } from 'express';
import multer from 'multer';
import { 
    registerCompanyAndUser, 
    getCompanies, 
    getCompanyById,
    getCompanyEmployeesProxy,
    getCompanyEmployeeByIdProxy,
    createCompanyEmployeeProxy,
    updateCompanyEmployeeProxy,
    changeCompanyEmployeeStatusProxy
} from './company.controller.js';
import { registerCompanyValidator } from '../../middlewares/companies-validators.js';
import { validateJWT, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();
const upload = multer(); // Almacenamiento en memoria para procesamiento en Saga

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: API para la gestión de Empresas y registro de Tenants
 */

/**
 * @swagger
 * /companies/register:
 *   post:
 *     summary: Registro unificado de Empresa y Administrador (Patrón Saga)
 *     description: Crea el perfil en MongoDB y las credenciales en PostgreSQL de forma atómica.
 *     tags: [Companies]
 *     consumes:
 *       - multipart/form-data
 *     responses:
 *       201:
 *         description: Empresa y usuario registrados exitosamente
 *       400:
 *         description: Error de validación o datos duplicados
 */
router.post(
    '/register',
    upload.single('logo'),
    registerCompanyValidator,
    registerCompanyAndUser
);

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Listado de empresas (Solo SUPER_ADMIN)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', validateJWT, authorizeRole('SUPER_ADMIN'), getCompanies);

// ================= EMPLOYEES / USERS PROXIES =================
router.get('/employees', validateJWT, getCompanyEmployeesProxy);
router.post('/employees', validateJWT, createCompanyEmployeeProxy);
router.get('/employees/:id', validateJWT, getCompanyEmployeeByIdProxy);
router.put('/employees/:id', validateJWT, updateCompanyEmployeeProxy);
router.put('/employees/:id/activate', validateJWT, changeCompanyEmployeeStatusProxy);
router.put('/employees/:id/desactivate', validateJWT, changeCompanyEmployeeStatusProxy);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Obtener detalles de una empresa específica
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', validateJWT, authorizeRole('SUPER_ADMIN', 'COMPANY_ADMIN'), getCompanyById);

export default router;
