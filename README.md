# Proyecto Restaurante

Esta documentación detalla la estructura, configuración y endpoints implementados hasta la fecha en el servidor administrativo (`server-admin`). El sistema está construido sobre **Node.js** con **Express** y **MongoDB**.


## Configuración General

* **Base URL:** `/restaurant/v1`
* **Seguridad:** Implementación de Helmet para cabeceras HTTP seguras y validación de tokens JWT para rutas protegidas.

---

## Requisitos (Requirements)

Para poder ejecutar el proyecto correctamente necesitas:

### Software
- **Node.js** (recomendado: LTS)
- **pnpm** (gestor de paquetes)
- **MongoDB** (local o remoto)
- **Git**
- **Docker** y **Docker Compose** para levantar el stack con contenedores

### Cuentas/Servicios (si aplican)
- **Cloudinary** (para carga/gestión de imágenes), si vas a usar la funcionalidad de subida de imágenes.

---

## Versiones utilizadas

Estas versiones están definidas en el proyecto:

  - **pnpm**: `10.28.1`
  - **express**: `5.2.1`
  - **mongoose**: `9.1.5`
  - **jsonwebtoken**: `9.0.3`
  - **helmet**: `8.1.0`
  - **multer**: `2.0.2`
  - **cloudinary**: `2.9.0`
  - **express-validator**: `7.3.1`
  - **nodemon**: `3.1.11`



---

## Estructura del proyecto (Orden de carpetas)

El repositorio contiene el servidor dentro de la carpeta `server-admin`.

Estructura general (alto nivel):

- `server-admin/`
  - `index.js` (punto de entrada del servidor)
  - `package.json` (scripts, dependencias y versiones)
  - `src/`
    - `users/` (módulo usuarios)
    - `restaurants/` (módulo restaurantes)
    - `menus/` (módulo menús)
    - `tables/` (módulo mesas)
    - `reservations/` (módulo reservaciones)
    - `middlewares/` (validaciones, JWT, subida de archivos, etc.)

---

## ¿Dónde están las rutas?

Las rutas están definidas por módulo dentro de `server-admin/src/<modulo>/*.routes.js`.

Ejemplos:
- `server-admin/src/users/user.routes.js`
- `server-admin/src/restaurants/restaurant.routes.js`
- `server-admin/src/menus/menu.routes.js`
- `server-admin/src/tables/table.routes.js`
- `server-admin/src/reservations/reservation.routes.js`



---

## Cómo clonar y ejecutar el proyecto (Clone & Run)

### 1) Clonar el repositorio y cambiar a la rama `dev`
```bash
git clone https://github.com/gc130041/proyecto-restaurante.git
cd proyecto-restaurante
git checkout dev
```



### 2) Instalar dependencias
El servidor está en `server-admin`:

```bash
cd server-admin
pnpm install
```

### 3) Variables de entorno
Crea un archivo `.env` (ubicación típica: `server-admin/.env`) con la configuración requerida para tu entorno.



### 4) Ejecutar en modo desarrollo o producción

**Desarrollo (con nodemon):**
```bash
pnpm dev
```

**Producción:**
```bash
pnpm start
```

---

## Consultas en Postman (GET, POST, PUT, etc.)

### Base
- **Base URL:** `/restaurant/v1`

Recomendación en Postman:
1. Crea un Environment y define por ejemplo:
   - `baseUrl` = `http://localhost:PUERTO/restaurant/v1`
2. Usa `{{baseUrl}}` en tus requests.

### Autenticación (JWT)
- Las rutas protegidas requieren token JWT (por ejemplo: listado de usuarios y perfil).
- Flujo típico:
  1. Registrar o loguear usuario (`/register` o `/login`)
  2. Copiar el token de la respuesta
  3. Enviar en Headers:
     - `Authorization: Bearer <TOKEN>`

---

## Endpoints

## Módulos del Sistema

### 1. Gestión de Usuarios (Users)

Este módulo maneja la autenticación y administración de usuarios del sistema.

* **Controlador:** `src/users/user.controller.js`
* **Rutas:** `src/users/user.routes.js`

| Método | Ruta | Función | Descripción |
| --- | --- | --- | --- |
| **POST** | `/register` | `register` | Registra un nuevo usuario (Cliente o Admin) con contraseña encriptada. |
| **POST** | `/login` | `login` | Autentica al usuario y retorna un token JWT válido. |
| **GET** | `/` | `getUsers` | Obtiene un listado paginado de los usuarios activos. |
| **GET** | `/profile` | `getProfile` | Retorna la información del perfil del usuario autenticado (requiere token). |

**Consultas sugeridas en Postman (Users):**
- **POST** `{{baseUrl}}/users/register`
  - Body (JSON): datos de registro
- **POST** `{{baseUrl}}/users/login`
  - Body (JSON): credenciales
- **GET** `{{baseUrl}}/users/`
  - Headers: `Authorization: Bearer <TOKEN>`
- **GET** `{{baseUrl}}/users/profile`
  - Headers: `Authorization: Bearer <TOKEN>`

---

### 2. Gestión de Restaurantes (Restaurants)

Permite la creación y administración de los establecimientos.

* **Controlador:** `src/restaurants/restaurant.controller.js`
* **Rutas:** `src/restaurants/restaurant.routes.js`

| Método | Ruta | Función | Descripción |
| --- | --- | --- | --- |
| **GET** | `/` | `getRestaurants` | Lista los restaurantes, permitiendo filtrar por estado activo. |
| **GET** | `/:id` | `getRestaurantById` | Busca un restaurante específico por su ID. |
| **POST** | `/` | `createRestaurant` | Crea un restaurante, permitiendo la carga de imágenes. |
| **PUT** | `/:id` | `updateRestaurant` | Actualiza los datos de un restaurante existente. |
| **PUT** | `/:id/activate` | `changeRestaurantStatus` | Cambia el estado del restaurante a activo. |
| **PUT** | `/:id/desactivate` | `changeRestaurantStatus` | Cambia el estado del restaurante a inactivo (baja lógica). |

**Consultas sugeridas en Postman (Restaurants):**
- **GET** `{{baseUrl}}/restaurants/`
- **GET** `{{baseUrl}}/restaurants/:id`
- **POST** `{{baseUrl}}/restaurants/`
  - Si hay subida de imágenes: `form-data` (según implementación). En el código se usa `uploadRestaurantImage.single('photos')`, por lo que el campo de archivo se llama **`photos`**.
- **PUT** `{{baseUrl}}/restaurants/:id`
  - Si hay imagen: `form-data` con **`photos`**
- **PUT** `{{baseUrl}}/restaurants/:id/activate`
- **PUT** `{{baseUrl}}/restaurants/:id/desactivate`

---

### 3. Gestión de Menús (Menus)

Administra los platos y bebidas disponibles en los restaurantes.

* **Controlador:** `src/menus/menu.controller.js`
* **Rutas:** `src/menus/menu.routes.js`

| Método | Ruta | Función | Descripción |
| --- | --- | --- | --- |
| **GET** | `/` | `getMenus` | Lista los platos del menú, con filtros por restaurante o categoría. |
| **GET** | `/:id` | `getMenuById` | Obtiene el detalle de un plato específico. |
| **POST** | `/` | `createMenu` | Registra un nuevo plato en el menú. |
| **PUT** | `/:id` | `updateMenu` | Modifica la información de un plato. |
| **PUT** | `/:id/activate` | `changeMenuStatus` | Activa la disponibilidad del plato. |
| **PUT** | `/:id/desactivate` | `changeMenuStatus` | Desactiva la disponibilidad del plato. |

**Consultas sugeridas en Postman (Menus):**
- **GET** `{{baseUrl}}/menus/`
- **GET** `{{baseUrl}}/menus/:id`
- **POST** `{{baseUrl}}/menus/`
  - En el código se usa `uploadMenuImage.single('image')`, por lo que el campo de archivo se llama **`image`** (cuando aplique).
- **PUT** `{{baseUrl}}/menus/:id`
  - `form-data` si envías imagen con **`image`**
- **PUT** `{{baseUrl}}/menus/:id/activate`
- **PUT** `{{baseUrl}}/menus/:id/desactivate`

---

### 4. Gestión de Mesas (Tables)

Controla el inventario de mesas por restaurante.

* **Controlador:** `src/tables/table.controller.js`
* **Rutas:** `src/tables/table.routes.js`

| Método | Ruta | Función | Descripción |
| --- | --- | --- | --- |
| **GET** | `/` | `getTables` | Lista las mesas, con opción de filtrar por restaurante. |
| **GET** | `/:id` | `getTableById` | Busca una mesa por su identificador. |
| **POST** | `/` | `createTable` | Agrega una nueva mesa al inventario. |
| **PUT** | `/:id` | `updateTable` | Actualiza datos de la mesa (ej. capacidad). |
| **PUT** | `/:id/activate` | `changeTableStatus` | Habilita una mesa. |
| **PUT** | `/:id/desactivate` | `changeTableStatus` | Deshabilita una mesa. |

**Consultas sugeridas en Postman (Tables):**
- **GET** `{{baseUrl}}/tables/`
- **GET** `{{baseUrl}}/tables/:id`
- **POST** `{{baseUrl}}/tables/`
- **PUT** `{{baseUrl}}/tables/:id`
- **PUT** `{{baseUrl}}/tables/:id/activate`
- **PUT** `{{baseUrl}}/tables/:id/desactivate`

---

### 5. Gestión de Reservaciones (Reservations)

Maneja el flujo principal de reservas y pedidos.

* **Controlador:** `src/reservations/reservation.controller.js`
* **Rutas:** `src/reservations/reservation.routes.js`

| Método | Ruta | Función | Descripción |
| --- | --- | --- | --- |
| **GET** | `/` | `getReservations` | Consulta reservaciones con filtros (usuario, restaurante, fecha). |
| **GET** | `/:id` | `getReservationById` | Obtiene el detalle completo de una reservación. |
| **POST** | `/` | `createReservation` | Crea una nueva reservación (En mesa, Para llevar, Domicilio). |
| **PUT** | `/:id` | `updateReservation` | Actualiza datos de la reservación (ej. estado, notas). |
| **PUT** | `/:id/activate` | `changeReservationStatus` | Reactiva una reservación. |
| **PUT** | `/:id/desactivate` | `changeReservationStatus` | Cancela o desactiva una reservación. |

**Consultas sugeridas en Postman (Reservations):**
- **GET** `{{baseUrl}}/reservations/`
- **GET** `{{baseUrl}}/reservations/:id`
- **POST** `{{baseUrl}}/reservations/`
- **PUT** `{{baseUrl}}/reservations/:id`
- **PUT** `{{baseUrl}}/reservations/:id/activate`
- **PUT** `{{baseUrl}}/reservations/:id/desactivate`

---

## Validaciones y Middlewares

El proyecto cuenta con validaciones robustas para asegurar la integridad de datos:

* **Validadores por Entidad:** Se utilizan archivos específicos (`users-validators.js`, `restaurants-validators.js`, etc.) que implementan `express-validator`.
* **Manejo de Archivos:** Middleware `file-uploader.js` para gestionar la carga de imágenes en restaurantes y menús.
* **Check Validators:** Middleware centralizado para recolectar y responder errores de validación.

---

## Docker / docker-compose

### Requisitos
- Tener instalado **Docker Desktop** (Windows/Mac) o Docker Engine (Linux).
- Tener disponible el comando `docker compose` (Compose v2).

### Comandos principales (Git Bash)

Levantar los servicios en segundo plano:
```bash
docker compose up -d
```

Detener los servicios (sin borrar volúmenes):
```bash
docker compose down
```

Listar contenedores activos:
```bash
docker ps
```

Detener servicios y borrar volúmenes (útil para “resetear” BD/datos persistidos):
```bash
docker compose down -v
```

### Comandos recomendados para uso correcto

Ver logs de todos los servicios:
```bash
docker compose logs -f
```

Ver logs de un servicio específico (reemplaza `NOMBRE_SERVICIO`):
```bash
docker compose logs -f NOMBRE_SERVICIO
```

Listar servicios definidos por el compose:
```bash
docker compose ps
```

Reiniciar un servicio:
```bash
docker compose restart NOMBRE_SERVICIO
```

Reconstruir imágenes y levantar:
```bash
docker compose up -d --build
```

Parar (sin eliminar) los contenedores:
```bash
docker compose stop
```

Arrancar contenedores ya creados:
```bash
docker compose start
```

Ejecutar un comando dentro de un contenedor (ejemplo: abrir shell):
```bash
docker compose exec NOMBRE_SERVICIO sh
```

Eliminar contenedores huérfanos:
```bash
docker compose up -d --remove-orphans
```

Limpiar imágenes/recursos no usados (con cuidado):
```bash
docker system prune
```

---

## Notas

- Algunas rutas usan **carga de archivos**:
  - Restaurantes: `uploadRestaurantImage.single('photos')` → campo **photos**
  - Menús: `uploadMenuImage.single('image')` → campo **image**
