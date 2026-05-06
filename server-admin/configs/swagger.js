import swaggerJsDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ERP Restaurant API',
            version: '1.0.0',
            description: 'API para la gestión centralizada de franquicias y sucursales (ERP)',
        },
        servers: [
            { url: 'http://localhost:3001/restaurant/v1' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/**/*.routes.js'],
};

export const swaggerSpec = swaggerJsDoc(options);
