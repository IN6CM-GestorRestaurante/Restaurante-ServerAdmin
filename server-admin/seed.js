import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/users/user.model.js';
import Branch from './src/branchs/branch.model.js';
import Table from './src/tables/table.model.js';
import Menu from './src/menus/menu.model.js';
import Order from './src/orders/order.model.js';
import Reservation from './src/reservations/reservation.model.js';

const seedDatabase = async () => {
    try {
        console.log("Intentando conectar a MongoDB...");
        await mongoose.connect(process.env.URI_MONGODB, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        });
        console.log("Conectado a MongoDB.");

        console.log("Limpiando la base de datos...");
        await Order.deleteMany();
        await Reservation.deleteMany();
        await Table.deleteMany();
        await Menu.deleteMany();
        await Branch.deleteMany();
        await User.deleteMany();

        console.log("Insertando usuarios...");
        const users = await User.insertMany([
            {
                name: 'Admin',
                surname: 'User',
                username: 'admin1',
                email: 'admin1@test.com',
                phone: '12345678',
                role: 'ADMIN'
            },
            {
                name: 'John',
                surname: 'Doe',
                username: 'johnd',
                email: 'johnd@test.com',
                phone: '87654321',
                role: 'CLIENT'
            },
            {
                name: 'Wait',
                surname: 'Er',
                username: 'waiter1',
                email: 'waiter1@test.com',
                phone: '11223344',
                role: 'WAITER'
            }
        ]);
        const clientId = users.find(u => u.role === 'CLIENT')._id;
        const waiterId = users.find(u => u.role === 'WAITER')._id;

        console.log("Insertando sucursales...");
        const branches = await Branch.insertMany([
            {
                name: 'El Gran Sabor',
                descripcion: 'Sucursal de comida tradicional con excelente ambiente familiar.',
                address: 'Calle Falsa 123',
                openingTime: '08:00',
                closingTime: '22:00',
                category: 'Casera',
                averagePrice: 15.5,
                email: 'contacto@elgransabor.com',
                phoneNumber: '5551234567'
            }
        ]);
        const branchId = branches[0]._id;

        console.log("Insertando mesas...");
        const tables = await Table.insertMany([
            {
                branch: branchId,
                number: 'T01',
                capacity: 4,
                location: 'Sala Principal',
                availabilitySchedules: [{day: 'Lunes', startTime: '08:00', endTime: '22:00'}]
            },
            {
                branch: branchId,
                number: 'V01',
                capacity: 2,
                location: 'Ventana',
                availabilitySchedules: [{day: 'Martes', startTime: '08:00', endTime: '22:00'}]
            }
        ]);
        const tableId = tables[0]._id;

        console.log("Insertando menú...");
        const menus = await Menu.insertMany([
            {
                branch: branchId,
                name: 'Sopa de Tomate',
                description: 'Deliciosa sopa de tomate fresco.',
                ingredients: ['Tomate', 'Ajo', 'Cebolla', 'Aceite de oliva'],
                price: 5.5,
                category: 'Entrada'
            },
            {
                branch: branchId,
                name: 'Pollo Asado',
                description: 'Pollo asado a la parrilla con hierbas.',
                ingredients: ['Pollo', 'Romero', 'Pimienta', 'Sal'],
                price: 12.0,
                category: 'Plato Fuerte'
            },
            {
                branch: branchId,
                name: 'Tarta de Queso',
                description: 'Tarta de queso casera con frutas del bosque.',
                ingredients: ['Queso', 'Azúcar', 'Huevos', 'Fresas'],
                price: 4.5,
                category: 'Postre'
            },
            {
                branch: branchId,
                name: 'Refresco',
                description: 'Refresco de cola bien frío.',
                ingredients: ['Agua', 'Azúcar', 'Gas'],
                price: 2.0,
                category: 'Bebida'
            }
        ]);
        const menuPlatoId = menus[1]._id;

        console.log("Insertando reservaciones...");
        await Reservation.insertMany([
            {
                user: clientId,
                branch: branchId,
                type: 'En Mesa',
                table: tableId,
                items: [{menuItem: menuPlatoId, quantity: 2}],
                date: new Date(Date.now() + 86400000),
                notes: 'Mesa de no fumadores'
            }
        ]);

        console.log("Insertando órdenes...");
        await Order.insertMany([
            {
                table: tableId,
                waiter: waiterId,
                branch: branchId,
                items: [
                    {menuItem: menuPlatoId, quantity: 2, price: 12.0, status: 'EN_ESPERA'}
                ],
                status: 'ABIERTA',
                total: 24.0
            }
        ]);

        console.log("¡Datos semilla insertados con éxito!");
        process.exit(0);
    } catch (error) {
        console.error("Error al insertar los datos: ", error);
        process.exit(1);
    }
};

seedDatabase();
