import multer from 'multer';
import dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import {v4 as uuidv4} from 'uuid';
import {extname} from 'path';

dotenv.config();

// Configuración global de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MIMETYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'image/avif',
    'image/svg+xml'
];

/**
 * Fábrica para crear cargadores de Multer configurados para Cloudinary.
 * 
 * @param {string} folder - Carpeta destino en la nube.
 * @param {object} customOptions - Configuración de formatos, tamaño y transformaciones.
 */
const createCloudinaryUploader = (folder, customOptions = {}) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: (req, file) => {
            const fileExt = extname(file.originalname);
            const baseName = file.originalname.replace(fileExt, '');
            const safeBase = baseName
                .toLowerCase()
                .replace(/[^a-z0-9]+/gi, '-')
                .replace(/^-+|-+$/g, '');

            const shortUuid = uuidv4().substring(0, 8);
            const publicId = `${safeBase}-${shortUuid}`;

            return {
                folder: folder,
                public_id: publicId,
                allowed_formats: customOptions.formats || ['jpeg', 'jpg', 'png', 'webp', 'avif'],
                transformation: customOptions.transformation || [{width: 1000, height: 1000, crop: 'limit'}],
                resource_type: 'image',
            };
        },
    });

    return multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (MIMETYPES.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(`Tipo de archivo no permitido. Solo se aceptan imágenes.`));
            }
        },
        limits: {
            fileSize: customOptions.maxSize || 10 * 1024 * 1024, // Por defecto 10MB
        },
    });
};

/**
 * Uploader para imágenes de sucursales.
 */
export const uploadBranchImage = createCloudinaryUploader('branches/branch');

/**
 * Uploader para imágenes de Menús.
 */
export const uploadMenuImage = createCloudinaryUploader('branches/menu');

/**
 * Uploader para Logos de Empresa.
 * Limitado a 2MB con transformaciones optimizadas para logos.
 */
export const uploadCompanyLogo = createCloudinaryUploader('companies', {
    formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    maxSize: 2 * 1024 * 1024,
    transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }]
});

export {cloudinary};