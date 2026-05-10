import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/users/user.model.js';
import Company from './src/companies/company.model.js';
import Branch from './src/branchs/branch.model.js';
import Table from './src/tables/table.model.js';
import Menu from './src/menus/menu.model.js';
import Ingredient from './src/ingredients/ingredient.model.js';
import Stock from './src/stocks/stock.model.js';
import Order from './src/orders/order.model.js';
import Reservation from './src/reservations/reservation.model.js';
import Invoice from './src/invoices/invoice.model.js';

const SEED_ENABLED = process.env.SEED_ENABLED !== 'false';

/**
 * Script de inicialización masiva (Mega-Seeder)
 * Crea un entorno multi-tenant realista para pruebas del ERP.
 * Es idempotente: Limpia la base de datos antes de insertar.
 * 
 * @author Antigravity
 */
const seedDatabase = async () => {
    if (!SEED_ENABLED) {
        console.log('⏭️  Seeder desactivado (SEED_ENABLED=false)');
        process.exit(0);
    }

    try {
        console.log('🚀 Iniciando Mega-Seeder...');
        await mongoose.connect(process.env.URI_MONGODB, { 
            serverSelectionTimeoutMS: 5000, 
            maxPoolSize: 10 
        });
        console.log('🟢 Conectado a MongoDB');

        console.log('🗑️  Limpiando base de datos...');
        await Invoice.deleteMany();
        await Reservation.deleteMany();
        await Order.deleteMany();
        await Stock.deleteMany();
        await Table.deleteMany();
        await Menu.deleteMany();
        await Ingredient.deleteMany();
        await Branch.deleteMany();
        await Company.deleteMany();
        await User.deleteMany();

        // 1. Crear Usuario COMPANY_ADMIN
        console.log('👤 Creando administrador de empresa...');
        const adminUser = await User.create({
            name: 'Carlos',
            surname: 'Mendoza',
            username: 'cmendoza',
            email: 'admin@restaurante.local',
            phone: '55512345',
            role: 'COMPANY_ADMIN',
            status: true
        });

        // 2. Crear Empresa
        console.log('🏢 Creando empresa...');
        const company = await Company.create({
            legalName: 'Restaurantes El Gran Sabor S.A.',
            alias: 'El Gran Sabor',
            taxId: 'NIT-123456-7',
            sector: 'Restaurante',
            companySize: '11-50',
            country: 'Guatemala',
            timezone: 'America/Guatemala',
            currency: 'GTQ',
            subdomain: 'elgransabor',
            owner: adminUser._id,
            plan: 'PRO'
        });

        // Vincular admin con empresa
        adminUser.companyId = company._id;
        await adminUser.save();

        // 3. Crear Sucursales
        console.log('📍 Creando sucursales...');
        const branches = await Branch.insertMany([
            {
                companyId: company._id,
                name: 'El Gran Sabor - Centro',
                description: 'Sucursal principal ubicada en el centro histórico con ambiente familiar.',
                address: '6a Avenida 12-45, Zona 1, Guatemala City',
                openingTime: '07:00',
                closingTime: '22:00',
                category: 'Casera',
                averagePrice: 65,
                email: 'centro@elgransabor.gt',
                phoneNumber: '+50255512345'
            },
            {
                companyId: company._id,
                name: 'El Gran Sabor - Zona 10',
                description: 'Sucursal moderna en zona empresarial con terraza y bar.',
                address: 'Boulevard Los Próceres 18-30, Zona 10, Guatemala City',
                openingTime: '08:00',
                closingTime: '23:00',
                category: 'Casera',
                averagePrice: 85,
                email: 'zona10@elgransabor.gt',
                phoneNumber: '+50255567890'
            }
        ]);
        const [centroBranch, zona10Branch] = branches;

        // 4. Crear Empleados
        console.log('👥 Creando empleados...');
        const employees = await User.insertMany([
            {
                name: 'Ana', surname: 'López', username: 'alopez',
                email: 'ana@elgransabor.gt', phone: '55500001',
                role: 'BRANCH_MANAGER', companyId: company._id, branchId: centroBranch._id
            },
            {
                name: 'Pedro', surname: 'García', username: 'pgarcia',
                email: 'pedro@elgransabor.gt', phone: '55500002',
                role: 'WAITER', companyId: company._id, branchId: centroBranch._id
            },
            {
                name: 'María', surname: 'Hernández', username: 'mhernandez',
                email: 'maria@elgransabor.gt', phone: '55500003',
                role: 'WAITER', companyId: company._id, branchId: zona10Branch._id
            },
            {
                name: 'Roberto', surname: 'Sánchez', username: 'rsanchez',
                email: 'roberto@elgransabor.gt', phone: '55500004',
                role: 'CHEF', companyId: company._id, branchId: centroBranch._id
            },
            {
                name: 'Laura', surname: 'Torres', username: 'ltorres',
                email: 'laura@elgransabor.gt', phone: '55500005',
                role: 'CASHIER', companyId: company._id, branchId: centroBranch._id
            }
        ]);

        // 5. Crear Ingredientes
        console.log('🍅 Creando catálogo de ingredientes...');
        const ingredientData = [
            { name: 'Pechuga de Pollo', unit: 'kg', costPrice: 45.00 },
            { name: 'Arroz', unit: 'kg', costPrice: 8.50 },
            { name: 'Frijoles Negros', unit: 'kg', costPrice: 12.00 },
            { name: 'Tomate', unit: 'kg', costPrice: 15.00 },
            { name: 'Cebolla', unit: 'kg', costPrice: 10.00 },
            { name: 'Ajo', unit: 'kg', costPrice: 35.00 },
            { name: 'Aceite de Oliva', unit: 'litro', costPrice: 55.00 },
            { name: 'Queso Fresco', unit: 'kg', costPrice: 50.00 },
            { name: 'Tortillas de Maíz', unit: 'paquete', costPrice: 5.00 },
            { name: 'Aguacate', unit: 'unidad', costPrice: 8.00 },
            { name: 'Limón', unit: 'unidad', costPrice: 1.50 },
            { name: 'Crema', unit: 'litro', costPrice: 25.00 },
            { name: 'Pan Francés', unit: 'unidad', costPrice: 2.00 },
            { name: 'Azúcar', unit: 'kg', costPrice: 7.00 },
            { name: 'Café Molido', unit: 'kg', costPrice: 65.00 }
        ].map(ing => ({ ...ing, companyId: company._id }));

        const ingredients = await Ingredient.insertMany(ingredientData);

        // Helper para buscar ID por nombre
        const getIngId = (name) => ingredients.find(i => i.name === name)._id;

        // 6. Crear Menú para sucursal Centro
        console.log('🍕 Creando menú...');
        const menus = await Menu.insertMany([
            {
                branch: centroBranch._id, companyId: company._id,
                name: 'Pollo en Pepián',
                description: 'Pollo en salsa tradicional guatemalteca de pepitoria y especias.',
                ingredients: ['Pollo', 'Tomate', 'Pepitoria'],
                recipe: [
                    { ingredientId: getIngId('Pechuga de Pollo'), quantityRequired: 0.35 },
                    { ingredientId: getIngId('Tomate'), quantityRequired: 0.15 },
                    { ingredientId: getIngId('Cebolla'), quantityRequired: 0.05 }
                ],
                price: 55.00, category: 'Plato Fuerte'
            },
            {
                branch: centroBranch._id, companyId: company._id,
                name: 'Desayuno Chapín',
                description: 'Huevos al gusto, frijoles, plátanos y queso fresco.',
                ingredients: ['Huevo', 'Frijoles', 'Queso'],
                recipe: [
                    { ingredientId: getIngId('Frijoles Negros'), quantityRequired: 0.20 },
                    { ingredientId: getIngId('Queso Fresco'), quantityRequired: 0.10 },
                    { ingredientId: getIngId('Tomate'), quantityRequired: 0.10 }
                ],
                price: 35.00, category: 'Plato Fuerte'
            },
            {
                branch: centroBranch._id, companyId: company._id,
                name: 'Tacos de Pollo',
                description: '3 tacos acompañados de guacamole y crema.',
                ingredients: ['Pollo', 'Tortillas', 'Aguacate'],
                recipe: [
                    { ingredientId: getIngId('Pechuga de Pollo'), quantityRequired: 0.15 },
                    { ingredientId: getIngId('Tortillas de Maíz'), quantityRequired: 3 },
                    { ingredientId: getIngId('Aguacate'), quantityRequired: 1 }
                ],
                price: 40.00, category: 'Plato Fuerte'
            },
            {
                branch: centroBranch._id, companyId: company._id,
                name: 'Café de Olla',
                description: 'Café tradicional con canela y pan francés.',
                ingredients: ['Café', 'Azúcar', 'Pan'],
                recipe: [
                    { ingredientId: getIngId('Café Molido'), quantityRequired: 0.02 },
                    { ingredientId: getIngId('Azúcar'), quantityRequired: 0.01 },
                    { ingredientId: getIngId('Pan Francés'), quantityRequired: 1 }
                ],
                price: 15.00, category: 'Bebida'
            }
        ]);

        // 7. Crear Stock
        console.log('📦 Creando stock inicial...');
        const stockEntries = [];
        for (const branch of branches) {
            for (const ing of ingredients) {
                stockEntries.push({
                    branchId: branch._id,
                    ingredientId: ing._id,
                    quantity: Math.floor(Math.random() * 80) + 20,
                    minStock: 10
                });
            }
        }
        await Stock.insertMany(stockEntries);

        // 8. Crear Mesas
        console.log('🪑 Configurando mesas...');
        const tables = await Table.insertMany([
            { branch: centroBranch._id, companyId: company._id, number: 'T01', capacity: 2, location: 'Ventana' },
            { branch: centroBranch._id, companyId: company._id, number: 'T02', capacity: 4, location: 'Sala Principal' },
            { branch: centroBranch._id, companyId: company._id, number: 'T03', capacity: 4, location: 'Sala Principal' },
            { branch: centroBranch._id, companyId: company._id, number: 'T04', capacity: 6, location: 'Terraza' },
            { branch: zona10Branch._id, companyId: company._id, number: 'Z01', capacity: 2, location: 'Bar' },
            { branch: zona10Branch._id, companyId: company._id, number: 'Z02', capacity: 4, location: 'Sala Principal' }
        ]);

        // 9. Órdenes
        console.log('📝 Generando órdenes de prueba...');
        const waiter = employees.find(e => e.role === 'WAITER');
        const orders = await Order.insertMany([
            {
                tables: [tables[0]._id], waiter: waiter._id, branch: centroBranch._id,
                status: 'pending', items: [
                    { menuItem: menus[0]._id, quantity: 2, priceAtTime: 55.00, status: 'pending' }
                ], total: 110.00
            },
            {
                tables: [tables[2]._id], waiter: waiter._id, branch: centroBranch._id,
                status: 'in-kitchen', items: [
                    { menuItem: menus[1]._id, quantity: 1, priceAtTime: 35.00, status: 'in-kitchen' },
                    { menuItem: menus[3]._id, quantity: 1, priceAtTime: 15.00, status: 'ready' }
                ], total: 50.00
            }
        ]);

        // 10. Reservaciones
        console.log('📅 Creando reservaciones...');
        await Reservation.insertMany([
            {
                branch: centroBranch._id, table: tables[3]._id, 
                date: new Date(Date.now() + 86400000), status: 'pending',
                type: 'En Mesa', notes: 'Aniversario'
            }
        ]);

        // 11. Facturas (DRAFT)
        console.log('🧾 Generando facturas...');
        await Invoice.insertMany([
            {
                invoiceNumber: 'FACT-D-001',
                orderId: orders[0]._id,
                branchId: centroBranch._id,
                companyId: company._id,
                billedBy: employees.find(e => e.role === 'CASHIER')._id,
                itemsSnapshot: orders[0].items.map(i => ({
                    menuItemName: 'Pollo en Pepián',
                    quantity: i.quantity,
                    priceAtTime: i.priceAtTime,
                    subtotal: i.priceAtTime * i.quantity
                })),
                subtotal: 110, totalAmount: 110, status: 'DRAFT'
            }
        ]);

        console.log('✅ Mega-Seeder completado con éxito.');
        console.log(`📊 Resumen: 1 Empresa, ${employees.length + 1} Usuarios, ${branches.length} Sucursales, ${menus.length} Platos.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en el seeder:', error);
        process.exit(1);
    }
};

seedDatabase();
