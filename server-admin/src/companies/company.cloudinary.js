import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sube un logo de empresa a Cloudinary directamente desde un buffer.
 * Se utiliza principalmente en el flujo de registro orquestado donde el logo se procesa en memoria.
 * 
 * @param {Buffer} buffer - Buffer de datos de la imagen.
 * @param {string} originalName - Nombre original del archivo para trazar el public_id.
 * @returns {Promise<string>} - Promesa que resuelve con la URL segura de la imagen.
 */
export const uploadLogoFromBuffer = (buffer, originalName) => {
    return new Promise((resolve, reject) => {
        // Generamos un public_id único basado en un prefijo y un UUID corto
        const publicId = `logo-${uuidv4().substring(0, 8)}`;
        
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'companies',
                public_id: publicId,
                transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    console.error('Error al subir a Cloudinary:', error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        // Enviamos el buffer al stream de subida
        uploadStream.end(buffer);
    });
};
