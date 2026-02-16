[33mcommit fccfcbc0eb4349783041c327c0f5af9d3642bc7d[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mdev[m[33m)[m
Author: ksolo-2022439 <ksolorzano-2022439@kinal.edu.gt>
Date:   Mon Feb 16 10:02:49 2026 -0600

    refactor: Fix de Dependencias

[33mcommit bfd977f5df1ba47faeb47ee74b46b0461d43666d[m[33m ([m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mmain[m[33m)[m
Author: SERV-DRV <sderosa-2023220@kinal.edu.gt>
Date:   Mon Feb 16 08:04:44 2026 -0600

    fix: Ruta

[33mcommit aa2bcb5a9506058ee5ab616ce15d043bd85d3734[m
Author: Kenneth Franklin Solórzano Canás <ksolorzano-2022439@kinal.edu.gt>
Date:   Mon Feb 16 07:24:34 2026 -0600

    refactor: Actualizar README

[33mcommit efe310b0c26c2c6e47c4b1f12fe240549e5c99cb[m
Author: gc130041 <ocontreras-2024150@kinal.edu.gt>
Date:   Sun Feb 15 20:35:55 2026 -0600

    feat: Agregar documentación

[33mcommit 89fc46f7e139d08aac55bd4b6b3319cf0ccac0af[m[33m ([m[1;31morigin/ft/ks[m[33m, [m[1;31morigin/dev[m[33m)[m
Author: ksolo-2022439 <ksolorzano-2022439@kinal.edu.gt>
Date:   Sun Feb 15 20:16:30 2026 -0600

    feat: Implementar user model, auth controllers, y jwt validation
    
    - Modelado de Usuarios (T14): Se creó el esquema de Mongoose para usuarios con roles (ADMIN_ROLE, CLIENT_ROLE) y encriptación de contraseñas.
    - Validaciones (T17 y T4): Se implementaron middlewares utilizando express-validator para el registro, login y actualización de usuarios.
    - Seguridad con JWT (T4): Se añadió la lógica para generar y validar tokens JWT para proteger las rutas privadas.
    - Controlador de Autenticación (T5 y T15): Se desarrollaron los endpoints de login, register y obtención de perfil de usuario.
    - Rutas de Usuario (T16): Se integraron los nuevos endpoints en la estructura de rutas del servidor.
    - Verificación de Sprint 1: Se confirmó que las configuraciones de base de datos, middlewares globales y los módulos de restaurantes, menús, mesas y reservaciones están correctamente implementados y operativos.

[33mcommit 3a6c6c868f96a4bdd26dc22972f9cf07b90c8c1d[m[33m ([m[1;31morigin/ft/sd[m[33m)[m
Author: SERV-DRV <sderosa-2023220@kinal.edu.gt>
Date:   Sun Feb 15 19:28:05 2026 -0600

    feat: Crear Model,Controller,Routes y validator.
    Se agrego servicio en la nube para subida de imagenes en cloudinary para
    menus y restaurants.
            - Menus
            - Reservations
            - Restaurants
            - Tables

[33mcommit 96ef9b11a8ad6af1f5c25758d51d8404c66ec754[m[33m ([m[1;31morigin/ft/om[m[33m, [m[1;31morigin/ft/gc[m[33m)[m
Author: gc130041 <ocontreras-2024150@kinal.edu.gt>
Date:   Sat Feb 14 18:13:15 2026 -0600

    feat: Creación y configuración del proyecto

[33mcommit 26664631a70b6d9c551b81a447f5d1fe6694b147[m
Author: gc130041 <ocontreras-2024150@kinal.edu.gt>
Date:   Sat Feb 14 13:08:25 2026 -0600

    Initial commit
