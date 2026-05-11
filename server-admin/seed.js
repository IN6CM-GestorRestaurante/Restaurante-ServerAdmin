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
import OrderAudit from './src/orders/orderAudit.model.js';

const SEED_ENABLED = process.env.SEED_ENABLED !== 'false';

/**
 * Mega-Seeder — Inicialización masiva para entorno de pruebas.
 * Crea un tenant completo con empresa, sucursales, empleados, menús (SINGLE + COMBO),
 * ingredientes, stock, órdenes, auditoría, reservaciones y facturas.
 * 
 * Idempotente: limpia toda la base antes de insertar.
 * Desactivable: SEED_ENABLED=false en .env
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

        // ═══════════════════════════════════════════════
        // LIMPIEZA (orden inverso de dependencias)
        // ═══════════════════════════════════════════════
        console.log('🗑️  Limpiando base de datos...');
        await OrderAudit.collection.deleteMany({});  // Bypass inmutability hooks
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

        // ═══════════════════════════════════════════════
        // 1. COMPANY_ADMIN
        // ═══════════════════════════════════════════════
        console.log('👤 Creando administrador de empresa...');
        const adminUser = await User.create({
            name: 'Carlos', surname: 'Mendoza', username: 'cmendoza',
            email: 'admin@restaurante.local', phone: '55512345',
            role: 'COMPANY_ADMIN', status: true
        });

        // ═══════════════════════════════════════════════
        // 2. COMPANY
        // ═══════════════════════════════════════════════
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
            owner: adminUser._id
        });

        adminUser.companyId = company._id;
        await adminUser.save();

        // ═══════════════════════════════════════════════
        // 3. SUCURSALES
        // ═══════════════════════════════════════════════
        console.log('📍 Creando sucursales...');
        const branches = await Branch.insertMany([
            {
                companyId: company._id,
                name: 'El Gran Sabor - Centro',
                description: 'Sucursal principal ubicada en el centro histórico con ambiente familiar y cocina tradicional.',
                address: '6a Avenida 12-45, Zona 1, Guatemala City',
                openingTime: '07:00', closingTime: '22:00',
                category: 'Casera', averagePrice: 65,
                email: 'centro@elgransabor.gt', phoneNumber: '+50255512345'
            },
            {
                companyId: company._id,
                name: 'El Gran Sabor - Zona 10',
                description: 'Sucursal moderna en zona empresarial con terraza y bar de especialidades.',
                address: 'Boulevard Los Próceres 18-30, Zona 10, Guatemala City',
                openingTime: '08:00', closingTime: '23:00',
                category: 'Casera', averagePrice: 85,
                email: 'zona10@elgransabor.gt', phoneNumber: '+50255567890'
            }
        ]);
        const [centroBranch, zona10Branch] = branches;

        // ═══════════════════════════════════════════════
        // 4. EMPLEADOS (roles canónicos)
        // ═══════════════════════════════════════════════
        console.log('👥 Creando empleados...');
        const employees = await User.insertMany([
            {
                name: 'Ana', surname: 'López', username: 'alopez', email: 'ana@elgransabor.gt', phone: '55500001',
                role: 'BRANCH_MANAGER', companyId: company._id, branchId: centroBranch._id
            },
            {
                name: 'Pedro', surname: 'García', username: 'pgarcia', email: 'pedro@elgransabor.gt', phone: '55500002',
                role: 'WAITER', companyId: company._id, branchId: centroBranch._id
            },
            {
                name: 'María', surname: 'Hernández', username: 'mhernandez', email: 'maria@elgransabor.gt', phone: '55500003',
                role: 'WAITER', companyId: company._id, branchId: zona10Branch._id
            },
            {
                name: 'Roberto', surname: 'Sánchez', username: 'rsanchez', email: 'roberto@elgransabor.gt', phone: '55500004',
                role: 'CHEF', companyId: company._id, branchId: centroBranch._id
            },
            {
                name: 'Laura', surname: 'Torres', username: 'ltorres', email: 'laura@elgransabor.gt', phone: '55500005',
                role: 'CASHIER', companyId: company._id, branchId: centroBranch._id
            }
        ]);

        // ═══════════════════════════════════════════════
        // 5. INGREDIENTES (catálogo global de la empresa)
        // ═══════════════════════════════════════════════
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

        const getIngId = (name) => ingredients.find(i => i.name === name)._id;

        // ═══════════════════════════════════════════════
        // 6. MENÚ — Platillos SINGLE + 1 COMBO
        // ═══════════════════════════════════════════════
        console.log('🍕 Creando menú (SINGLE + COMBO)...');

        // 6a. Platillos individuales (SINGLE)
        const singleMenus = await Menu.insertMany([
            {
                branch: centroBranch._id, companyId: company._id, itemType: 'SINGLE',
                name: 'Pollo en Pepián',
                description: 'Pollo en salsa tradicional guatemalteca de pepitoria y especias.',
                recipe: [
                    { ingredientId: getIngId('Pechuga de Pollo'), quantityRequired: 0.35 },
                    { ingredientId: getIngId('Tomate'), quantityRequired: 0.15 },
                    { ingredientId: getIngId('Cebolla'), quantityRequired: 0.05 }
                ],
                price: 55.00, category: 'Plato Fuerte'
            },
            {
                branch: centroBranch._id, companyId: company._id, itemType: 'SINGLE',
                name: 'Desayuno Chapín',
                description: 'Huevos al gusto, frijoles volteados, plátanos fritos y queso fresco.',
                recipe: [
                    { ingredientId: getIngId('Frijoles Negros'), quantityRequired: 0.20 },
                    { ingredientId: getIngId('Queso Fresco'), quantityRequired: 0.10 },
                    { ingredientId: getIngId('Tomate'), quantityRequired: 0.10 }
                ],
                price: 35.00, category: 'Plato Fuerte'
            },
            {
                branch: centroBranch._id, companyId: company._id, itemType: 'SINGLE',
                name: 'Tacos de Pollo',
                description: '3 tacos de pollo acompañados de guacamole y crema.',
                recipe: [
                    { ingredientId: getIngId('Pechuga de Pollo'), quantityRequired: 0.15 },
                    { ingredientId: getIngId('Tortillas de Maíz'), quantityRequired: 3 },
                    { ingredientId: getIngId('Aguacate'), quantityRequired: 1 }
                ],
                price: 40.00, category: 'Plato Fuerte'
            },
            {
                branch: centroBranch._id, companyId: company._id, itemType: 'SINGLE',
                name: 'Café de Olla',
                description: 'Café tradicional con canela, piloncillo y pan francés.',
                recipe: [
                    { ingredientId: getIngId('Café Molido'), quantityRequired: 0.02 },
                    { ingredientId: getIngId('Azúcar'), quantityRequired: 0.01 },
                    { ingredientId: getIngId('Pan Francés'), quantityRequired: 1 }
                ],
                price: 15.00, category: 'Bebida'
            },
            {
                branch: centroBranch._id, companyId: company._id, itemType: 'SINGLE',
                name: 'Limonada Natural',
                description: 'Limonada fresca con hielo y un toque de azúcar.',
                recipe: [
                    { ingredientId: getIngId('Limón'), quantityRequired: 3 },
                    { ingredientId: getIngId('Azúcar'), quantityRequired: 0.03 }
                ],
                price: 12.00, category: 'Bebida'
            }
        ]);

        // 6b. Combo (referencia a platillos SINGLE existentes)
        const comboMenu = await Menu.create({
            branch: centroBranch._id, companyId: company._id, itemType: 'COMBO',
            name: 'Combo Almuerzo Chapín',
            description: 'Incluye Pollo en Pepián + Limonada Natural. ¡El combo más popular!',
            recipe: [],  // Los combos no tienen receta propia
            comboItems: [
                { menuItemId: singleMenus[0]._id, quantity: 1 },  // Pollo en Pepián
                { menuItemId: singleMenus[4]._id, quantity: 1 }   // Limonada Natural
            ],
            price: 60.00,  // Precio combo (menor que 55 + 12 = 67 individual)
            category: 'Combo',
            promotion: {
                isActive: true,
                discountType: 'PERCENTAGE',
                discountValue: 10,
                startsAt: new Date(),
                endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        const allMenus = [...singleMenus, comboMenu];

        // ═══════════════════════════════════════════════
        // 7. STOCK (inventario por sucursal)
        // ═══════════════════════════════════════════════
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

        // ═══════════════════════════════════════════════
        // 8. MESAS
        // ═══════════════════════════════════════════════
        console.log('🪑 Configurando mesas...');
        const tables = await Table.insertMany([
            { branch: centroBranch._id, companyId: company._id, number: 'T01', capacity: 2, location: 'Ventana' },
            { branch: centroBranch._id, companyId: company._id, number: 'T02', capacity: 4, location: 'Sala Principal' },
            { branch: centroBranch._id, companyId: company._id, number: 'T03', capacity: 4, location: 'Sala Principal' },
            { branch: centroBranch._id, companyId: company._id, number: 'T04', capacity: 6, location: 'Terraza' },
            { branch: zona10Branch._id, companyId: company._id, number: 'Z01', capacity: 2, location: 'Bar' },
            { branch: zona10Branch._id, companyId: company._id, number: 'Z02', capacity: 4, location: 'Sala Principal' }
        ]);

        // ═══════════════════════════════════════════════
        // 9. ÓRDENES + AUDITORÍA
        // ═══════════════════════════════════════════════
        console.log('📝 Generando órdenes de prueba...');
        const waiter = employees.find(e => e.role === 'WAITER' && e.branchId.toString() === centroBranch._id.toString());

        // Orden 1: pending (platillo single)
        const order1 = await Order.create({
            tables: [tables[0]._id], waiter: waiter._id, branch: centroBranch._id,
            status: 'pending',
            items: [
                { menuItem: singleMenus[0]._id, quantity: 2, priceAtTime: 55.00, status: 'pending' }
            ],
            total: 110.00
        });

        // Orden 2: in-kitchen (incluye un COMBO)
        const order2 = await Order.create({
            tables: [tables[2]._id], waiter: waiter._id, branch: centroBranch._id,
            status: 'in-kitchen',
            items: [
                { menuItem: comboMenu._id, quantity: 1, priceAtTime: 54.00, status: 'in-kitchen' },
                { menuItem: singleMenus[3]._id, quantity: 2, priceAtTime: 15.00, status: 'ready' }
            ],
            total: 84.00
        });

        // Registros de auditoría para las órdenes
        console.log('📋 Creando registros de auditoría...');
        await OrderAudit.collection.insertMany([
            {
                orderId: order1._id,
                actorId: waiter._id, actorRole: 'WAITER', actorName: `${waiter.name} ${waiter.surname}`,
                action: 'ORDER_CREATED',
                details: { description: `Orden creada con 1 ítem en mesa T01` },
                branchId: centroBranch._id, companyId: company._id,
                performedAt: new Date(Date.now() - 3600000)
            },
            {
                orderId: order2._id,
                actorId: waiter._id, actorRole: 'WAITER', actorName: `${waiter.name} ${waiter.surname}`,
                action: 'ORDER_CREATED',
                details: { description: `Orden creada con 2 ítems (incluye combo) en mesa T03` },
                branchId: centroBranch._id, companyId: company._id,
                performedAt: new Date(Date.now() - 1800000)
            },
            {
                orderId: order2._id,
                actorId: waiter._id, actorRole: 'WAITER', actorName: `${waiter.name} ${waiter.surname}`,
                action: 'ORDER_STATUS_CHANGED',
                details: { previousStatus: 'pending', newStatus: 'in-kitchen', description: 'Orden enviada a cocina' },
                branchId: centroBranch._id, companyId: company._id,
                performedAt: new Date(Date.now() - 900000)
            }
        ]);

        // ═══════════════════════════════════════════════
        // 10. RESERVACIONES
        // ═══════════════════════════════════════════════
        console.log('📅 Creando reservaciones...');
        await Reservation.insertMany([
            {
                branch: centroBranch._id, table: tables[3]._id,
                date: new Date(Date.now() + 86400000), status: 'pending',
                type: 'En Mesa', notes: 'Cena de aniversario — 6 personas'
            }
        ]);

        // ═══════════════════════════════════════════════
        // 11. FACTURAS (DRAFT)
        // ═══════════════════════════════════════════════
        console.log('🧾 Generando facturas...');
        const cashier = employees.find(e => e.role === 'CASHIER');
        await Invoice.insertMany([
            {
                invoiceNumber: 'FACT-D-001',
                orderId: order1._id,
                branchId: centroBranch._id, companyId: company._id,
                billedBy: cashier._id,
                itemsSnapshot: [
                    { menuItemName: 'Pollo en Pepián', quantity: 2, priceAtTime: 55.00, subtotal: 110.00 }
                ],
                subtotal: 110.00, totalAmount: 110.00, status: 'DRAFT'
            }
        ]);

        // ═══════════════════════════════════════════════
        // RESUMEN
        // ═══════════════════════════════════════════════
        console.log('\n✅ ¡Mega-Seeder completado con éxito!');
        console.log('📊 Resumen:');
        console.log(`   🏢 1 Empresa: ${company.alias}`);
        console.log(`   👤 ${employees.length + 1} Usuarios (1 COMPANY_ADMIN + ${employees.length} empleados)`);
        console.log(`   📍 ${branches.length} Sucursales`);
        console.log(`   🍅 ${ingredients.length} Ingredientes`);
        console.log(`   🍕 ${allMenus.length} Platillos (${singleMenus.length} SINGLE + 1 COMBO)`);
        console.log(`   📦 ${stockEntries.length} Entradas de Stock`);
        console.log(`   🪑 ${tables.length} Mesas`);
        console.log(`   📝 2 Órdenes (1 pending + 1 in-kitchen con COMBO)`);
        console.log(`   📋 3 Registros de Auditoría`);
        console.log(`   📅 1 Reservación`);
        console.log(`   🧾 1 Factura (DRAFT)`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en el seeder:', error);
        process.exit(1);
    }
};

seedDatabase();
