import cors from 'cors';

const whiteList = ['http://localhost:5173', 'https://admin.restaurante.local'];

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS_VIOLATION: Origen no autorizado por políticas del sistema.'));
    }
  },
  credentials: true, // Mandatorio para habilitar la transmisión de la cookie HttpOnly
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

export default corsOptions;