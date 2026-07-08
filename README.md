# Restaurante - Server Admin API

Este repositorio contiene el backend (API REST) especializado en las operaciones administrativas del ecosistema del Restaurante. Está diseñado en Node.js con Express y MongoDB, enfocándose en la gestión segura y eficiente del menú, las categorías y las sucursales.

## 🚀 Funcionalidad y Alcance
Esta API permite a los administradores del sistema interactuar con los datos core del restaurante:
- **Gestión de Platillos y Categorías:** Agregar, modificar, listar y eliminar ítems del menú.
- **Manejo Inteligente de IDs:** Uso de `sqids` para generar identificadores cortos y amigables.
- **Almacenamiento Multimedia:** Carga directa de imágenes de platillos hacia la nube usando Cloudinary.
- **Autenticación Protegida:** Validación de tokens JWT para asegurar que solo usuarios con rol de administrador puedan realizar operaciones destructivas.

## 🛠 Stack Tecnológico
- **Core:** Node.js, Express.js (v5.2.1)
- **Base de Datos:** MongoDB (Mongoose v9.1.5)
- **Carga de Archivos:** Multer & Cloudinary
- **Seguridad y Utilidades:** Bcryptjs, JWT, Sqids, Helmet, CORS, Express Rate Limit
- **Documentación:** Swagger UI Express

## 📁 Estructura del Directorio
El código fuente principal se encuentra dentro de la carpeta `server-admin/`:
```
Restaurante-ServerAdmin/
└── server-admin/
    ├── configs/         # Inicialización de DB, Cloudinary, etc.
    ├── middlewares/     # Protección de rutas (auth), manejadores de error y rate limiting
    ├── src/             # Lógica de negocio (Controladores, Modelos, Rutas)
    ├── index.js         # Entry point de la aplicación Express
    └── package.json     # Gestión de dependencias
```

## 📋 Requisitos de Entorno
- Node.js v18+
- Instancia de MongoDB activa (Local o Atlas)
- Credenciales de Cloudinary
- PNPM (Administrador de paquetes recomendado)

## ⚙️ Pasos para Instalación

1. **Clonar el proyecto:**
   ```bash
   git clone https://github.com/IN6CM-GestorRestaurante/Restaurante-ServerAdmin.git
   cd Restaurante-ServerAdmin/server-admin
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Variables de Entorno (.env):**
   Crea el archivo `.env` dentro de la carpeta `server-admin` y provee los siguientes valores esenciales:
   ```env
   PORT=4000
   MONGODB_URI=tu_conexion_de_mongo
   JWT_SECRET=tu_clave_super_secreta
   CLOUDINARY_CLOUD_NAME=nombre_en_cloudinary
   CLOUDINARY_API_KEY=clave_api
   CLOUDINARY_API_SECRET=secreto_api
   ```

4. **Levantar el proyecto:**
   ```bash
   pnpm run dev
   ```
   *Nota: También existe un script `pnpm run seed` para poblar la base de datos con datos de prueba si fue configurado previamente.*

## 📌 Documentación Interactiva
Visita la documentación en vivo (Swagger) corriendo el proyecto y accediendo a:
```
http://localhost:4000/api-docs
```
