# Proyecto Restaurante

Esta documentación detalla la estructura, configuración y endpoints implementados hasta la fecha en el servidor administrativo (`server-admin`). El sistema está construido sobre **Node.js** con **Express** y **MongoDB**.


## Configuración General

* **Base URL:** `/restaurant/v1`
* **Seguridad:** Implementación de Helmet para cabeceras HTTP seguras y validación de tokens JWT para rutas protegidas.

---

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

## Validaciones y Middlewares

El proyecto cuenta con validaciones robustas para asegurar la integridad de datos:

* **Validadores por Entidad:** Se utilizan archivos específicos (`users-validators.js`, `restaurants-validators.js`, etc.) que implementan `express-validator`.
* **Manejo de Archivos:** Middleware `file-uploader.js` para gestionar la carga de imágenes en restaurantes y menús.
* **Check Validators:** Middleware centralizado para recolectar y responder errores de validación.
