# 🍽️ Proyecto Restaurante API

Bienvenido a la API del Proyecto Restaurante. Este servicio gestiona el menú, la toma de pedidos y la administración de usuarios para el sistema del restaurante.

## 🚀 Comenzando

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas.

### 📋 Pre-requisitos

*   **Node.js** v14+ (o Python 3.8+ / PHP 8.0+ según tu caso)
*   **Base de Datos**: MySQL / MongoDB / PostgreSQL
*   **Gestor de Paquetes**: npm / pip / composer

### 🔧 Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/gc130041/proyecto-restaurante.git
    cd proyecto-restaurante
    ```

2.  **Instalar dependencias:**
    ```bash
    # Si es Node.js:
    npm install
    
    # Si es Python:
    pip install -r requirements.txt
    ```

3.  **Configurar Variables de Entorno (.env):**
    Crea un archivo `.env` en la raíz y configura tus credenciales:
    ```env
    PORT=3000
    DB_URI=mongodb://localhost:27017/restaurante_db  # O tu conexión SQL
    JWT_SECRET=tu_secreto_super_seguro
    ```

4.  **Ejecutar el Servidor:**
    ```bash
    # Desarrollo
    npm run dev  # o python app.py
    ```

## 📖 Documentación de API (Endpoints)

La API corre por defecto en `http://localhost:3000/api`.

### 🍔 Menú (Productos)

| Método | Endpoint       | Descripción                        | Auth Requerida |
| :---   | :---           | :---                               | :---: |
| `GET`  | `/menu`        | Obtener todos los platillos        | ❌ |
| `GET`  | `/menu/:id`    | Obtener detalle de un platillo     | ❌ |
| `POST` | `/menu`        | Crear un nuevo platillo (Admin)    | ✅ |
| `PUT`  | `/menu/:id`    | Actualizar platillo (Admin)        | ✅ |
| `DELETE`| `/menu/:id`   | Eliminar platillo (Admin)          | ✅ |

### 🛒 Pedidos (Orders)

| Método | Endpoint       | Descripción                        | Auth Requerida |
| :---   | :---           | :---                               | :---: |
| `POST` | `/orders`      | Crear un nuevo pedido              | ✅ |
| `GET`  | `/orders`      | Ver historial de pedidos (Usuario) | ✅ |
| `GET`  | `/orders/all`  | Ver todos los pedidos (Admin)      | ✅ |

### 👤 Usuarios & Auth

| Método | Endpoint       | Descripción                        |
| :---   | :---           | :---                               |
| `POST` | `/auth/login`  | Iniciar sesión (Retorna Token)     |
| `POST` | `/auth/register`| Registrar nuevo usuario           |