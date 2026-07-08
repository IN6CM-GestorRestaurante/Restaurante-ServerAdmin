import 'dotenv/config';
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    name: String, surname: String, username: String, email: String, phone: String, role: String, status: Boolean, companyId: mongoose.Schema.Types.ObjectId, branchId: mongoose.Schema.Types.ObjectId
});
const User = mongoose.models.User || mongoose.model('User', userSchema);
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

// Mongoose Object IDs constantes para consistencia cruzada con Entity Framework (SQL Server)
const Ids = {
    // Pollo Campero
    Campero: {
        Company: new mongoose.Types.ObjectId('c00000000000000000000001'),
        Branch1: new mongoose.Types.ObjectId('b00000000000000000000011'),
        Branch2: new mongoose.Types.ObjectId('b00000000000000000000012'),
        Users: {
            Admin: new mongoose.Types.ObjectId('e00000000000000000000010'),
            Manager1: new mongoose.Types.ObjectId('e00000000000000000000011'),
            Waiter1: new mongoose.Types.ObjectId('e00000000000000000000012'),
            Chef1: new mongoose.Types.ObjectId('e00000000000000000000013'),
            Cashier1: new mongoose.Types.ObjectId('e00000000000000000000014'),
            Manager2: new mongoose.Types.ObjectId('e00000000000000000000015'),
            Waiter2: new mongoose.Types.ObjectId('e00000000000000000000016'),
            Chef2: new mongoose.Types.ObjectId('e00000000000000000000017'),
            Cashier2: new mongoose.Types.ObjectId('e00000000000000000000018'),
            Client1: new mongoose.Types.ObjectId('e00000000000000000000019'),
            Client2: new mongoose.Types.ObjectId('e0000000000000000000001a'),
            Client3: new mongoose.Types.ObjectId('e0000000000000000000001b'),
            ClientGeneral: new mongoose.Types.ObjectId('e00000000000000000000030'),
        }
    },
    // Mc Donalds
    McDo: {
        Company: new mongoose.Types.ObjectId('c00000000000000000000002'),
        Branch1: new mongoose.Types.ObjectId('b00000000000000000000021'),
        Branch2: new mongoose.Types.ObjectId('b00000000000000000000022'),
        Users: {
            Admin: new mongoose.Types.ObjectId('e00000000000000000000020'),
            Manager1: new mongoose.Types.ObjectId('e00000000000000000000021'),
            Waiter1: new mongoose.Types.ObjectId('e00000000000000000000022'),
            Chef1: new mongoose.Types.ObjectId('e00000000000000000000023'),
            Cashier1: new mongoose.Types.ObjectId('e00000000000000000000024'),
            Manager2: new mongoose.Types.ObjectId('e00000000000000000000025'),
            Waiter2: new mongoose.Types.ObjectId('e00000000000000000000026'),
            Chef2: new mongoose.Types.ObjectId('e00000000000000000000027'),
            Cashier2: new mongoose.Types.ObjectId('e00000000000000000000028'),
            Client1: new mongoose.Types.ObjectId('e00000000000000000000029'),
            Client2: new mongoose.Types.ObjectId('e0000000000000000000002a'),
            Client3: new mongoose.Types.ObjectId('e0000000000000000000002b'),
        }
    }
};

const seedDatabase = async () => {
    if (!SEED_ENABLED) {
        console.log('⏭️  Seeder desactivado (SEED_ENABLED=false)');
        process.exit(0);
    }

    try {
        console.log('🚀 Iniciando Mega-Seeder para Pollo Campero y Mc Donalds...');
        await mongoose.connect(process.env.URI_MONGODB, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        console.log('🟢 Conectado a MongoDB');

        // LIMPIEZA
        console.log('🗑️  Limpiando base de datos...');
        await OrderAudit.collection.deleteMany({});
        await Invoice.collection.deleteMany({});
        await Reservation.collection.deleteMany({});
        await Order.collection.deleteMany({});
        await Stock.collection.deleteMany({});
        await Table.collection.deleteMany({});
        await Menu.collection.deleteMany({});
        await Ingredient.collection.deleteMany({});
        await Branch.collection.deleteMany({});
        await Company.collection.deleteMany({});
        await User.collection.deleteMany({});

        // ═══════════════════════════════════════════════
        // EMPRESAS Y SUCURSALES
        // ═══════════════════════════════════════════════
        console.log('🏢 Creando empresas y sucursales...');
        
        // Pollo Campero
        const campero = await Company.create({
            _id: Ids.Campero.Company,
            legalName: 'Pollo Campero S.A.', alias: 'Pollo Campero',
            taxId: 'NIT-987654-3', sector: 'Restaurante', companySize: '200+',
            country: 'Guatemala', timezone: 'America/Guatemala', currency: 'GTQ',
            subdomain: 'campero', owner: Ids.Campero.Users.Admin,
            isActive: true, logo: 'https://via.placeholder.com/150'
        });

        const camperoBranches = await Branch.insertMany([
            {
                _id: Ids.Campero.Branch1, companyId: campero._id,
                name: 'Campero Zona 1', description: 'Sucursal icónica en el centro histórico.',
                address: '6a Avenida 10-20, Zona 1, Guatemala City',
                openingTime: '06:00', closingTime: '22:00',
                category: 'Comida Rápida', averagePrice: 45,
                photos: ['https://res.cloudinary.com/dueikakf8/image/upload/v1783464025/branches/branch/pollo-campero-zona-1-e4addcfc.jpg'],
                email: 'zona1@campero.com', phoneNumber: '+50255500010',
                isActive: true, state: 'Operativa'
            },
            {
                _id: Ids.Campero.Branch2, companyId: campero._id,
                name: 'Campero Majadas', description: 'Sucursal moderna con autoservicio.',
                address: 'Parque Majadas, Zona 11, Guatemala City',
                openingTime: '07:00', closingTime: '23:00',
                category: 'Comida Rápida', averagePrice: 50,
                photos: ['https://res.cloudinary.com/dueikakf8/image/upload/v1783464034/branches/branch/pollo-campero-majadas-dca8745d.jpg'],
                email: 'majadas@campero.com', phoneNumber: '+50255500011',
                isActive: true, state: 'Operativa'
            }
        ]);

        // Mc Donalds
        const mcdo = await Company.create({
            _id: Ids.McDo.Company,
            legalName: 'Restaurantes Mc Donalds Mesoamerica', alias: 'Mc Donalds',
            taxId: 'NIT-112233-4', sector: 'Restaurante', companySize: '200+',
            country: 'Guatemala', timezone: 'America/Guatemala', currency: 'GTQ',
            subdomain: 'mcdonalds', owner: Ids.McDo.Users.Admin,
            isActive: true, logo: 'https://via.placeholder.com/150'
        });

        const mcdoBranches = await Branch.insertMany([
            {
                _id: Ids.McDo.Branch1, companyId: mcdo._id,
                name: 'Mc Donalds Roosevelt', description: 'Sucursal grande sobre calzada principal.',
                address: 'Calzada Roosevelt, Zona 7, Guatemala City',
                openingTime: '06:00', closingTime: '23:59',
                category: 'Comida Rápida', averagePrice: 40,
                photos: ['https://res.cloudinary.com/dueikakf8/image/upload/v1783463738/branches/branch/mc-donalds-roosevelt-74a990e1.webp'],
                email: 'roosevelt@mcdonalds.com', phoneNumber: '+50255500020',
                isActive: true, state: 'Operativa'
            },
            {
                _id: Ids.McDo.Branch2, companyId: mcdo._id,
                name: 'Mc Donalds Cayalá', description: 'Restaurante premium en Paseo Cayalá.',
                address: 'Paseo Cayalá, Zona 16, Guatemala City',
                openingTime: '07:00', closingTime: '23:00',
                category: 'Comida Rápida', averagePrice: 45,
                photos: ['https://res.cloudinary.com/dueikakf8/image/upload/v1783463750/branches/branch/mc-donalds-cayala-cf1c8b0b.jpg'],
                email: 'cayala@mcdonalds.com', phoneNumber: '+50255500021',
                isActive: true, state: 'Operativa'
            }
        ]);

        // ═══════════════════════════════════════════════
        // EMPLEADOS
        // ═══════════════════════════════════════════════
        console.log('👥 Creando empleados de ambas marcas...');
        const usersToInsert = [
            // CAMPERO - ADMIN
            { _id: Ids.Campero.Users.Admin, name: 'Juan', surname: 'Bautista', username: 'jbautista', email: 'admin@campero.com', phone: '55511111', role: 'COMPANY_ADMIN', status: true, companyId: campero._id },
            // CAMPERO - BRANCH 1
            { _id: Ids.Campero.Users.Manager1, name: 'Luis', surname: 'Perez', username: 'lperez', email: 'manager1@campero.com', phone: '55511112', role: 'BRANCH_MANAGER', status: true, companyId: campero._id, branchId: Ids.Campero.Branch1 },
            { _id: Ids.Campero.Users.Waiter1, name: 'Sofia', surname: 'Castro', username: 'scastro', email: 'waiter1@campero.com', phone: '55511113', role: 'WAITER', status: true, companyId: campero._id, branchId: Ids.Campero.Branch1 },
            { _id: Ids.Campero.Users.Chef1, name: 'Mario', surname: 'Ruiz', username: 'mruiz', email: 'chef1@campero.com', phone: '55511114', role: 'CHEF', status: true, companyId: campero._id, branchId: Ids.Campero.Branch1 },
            { _id: Ids.Campero.Users.Cashier1, name: 'Ana', surname: 'Lopez', username: 'alopez', email: 'cashier1@campero.com', phone: '55511115', role: 'CASHIER', status: true, companyId: campero._id, branchId: Ids.Campero.Branch1 },
            // CAMPERO - BRANCH 2
            { _id: Ids.Campero.Users.Manager2, name: 'Carlos', surname: 'Giron', username: 'cgiron', email: 'manager2@campero.com', phone: '55511116', role: 'BRANCH_MANAGER', status: true, companyId: campero._id, branchId: Ids.Campero.Branch2 },
            { _id: Ids.Campero.Users.Waiter2, name: 'Diana', surname: 'Morales', username: 'dmorales', email: 'waiter2@campero.com', phone: '55511117', role: 'WAITER', status: true, companyId: campero._id, branchId: Ids.Campero.Branch2 },
            { _id: Ids.Campero.Users.Chef2, name: 'Pedro', surname: 'Gomez', username: 'pgomez', email: 'chef2@campero.com', phone: '55511118', role: 'CHEF', status: true, companyId: campero._id, branchId: Ids.Campero.Branch2 },
            { _id: Ids.Campero.Users.Cashier2, name: 'Maria', surname: 'Sosa', username: 'msosa', email: 'cashier2@campero.com', phone: '55511119', role: 'CASHIER', status: true, companyId: campero._id, branchId: Ids.Campero.Branch2 },
            // CAMPERO - CLIENTES
            { _id: Ids.Campero.Users.Client1, name: 'Cliente', surname: 'Campero', username: 'ccampero', email: 'cliente@campero.com', phone: '55511120', role: 'CLIENT', status: true, companyId: campero._id },
            { _id: Ids.Campero.Users.Client2, name: 'Fernando', surname: 'Alvarez', username: 'falvarez', email: 'cliente.vip@campero.com', phone: '55511121', role: 'CLIENT', status: true, companyId: campero._id, branchId: Ids.Campero.Branch1 },
            { _id: Ids.Campero.Users.Client3, name: 'Gabriela', surname: 'Mendoza', username: 'gmendoza', email: 'cliente.frecuente@campero.com', phone: '55511122', role: 'CLIENT', status: true, companyId: campero._id, branchId: Ids.Campero.Branch2 },
            { _id: Ids.Campero.Users.ClientGeneral, name: 'Martin', surname: 'Garces', username: 'mgarces', email: 'cliente@restaurante.local', phone: '55533333', role: 'CLIENT', status: true, companyId: campero._id },
            
            // MCDONALDS - ADMIN
            { _id: Ids.McDo.Users.Admin, name: 'Ronald', surname: 'Mac', username: 'rmac', email: 'admin@mcdonalds.com', phone: '55522221', role: 'COMPANY_ADMIN', status: true, companyId: mcdo._id },
            // MCDONALDS - BRANCH 1
            { _id: Ids.McDo.Users.Manager1, name: 'Oscar', surname: 'Pinto', username: 'opinto', email: 'manager1@mcdonalds.com', phone: '55522222', role: 'BRANCH_MANAGER', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch1 },
            { _id: Ids.McDo.Users.Waiter1, name: 'Elena', surname: 'Cruz', username: 'ecruz', email: 'waiter1@mcdonalds.com', phone: '55522223', role: 'WAITER', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch1 },
            { _id: Ids.McDo.Users.Chef1, name: 'Hugo', surname: 'Leon', username: 'hleon', email: 'chef1@mcdonalds.com', phone: '55522224', role: 'CHEF', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch1 },
            { _id: Ids.McDo.Users.Cashier1, name: 'Rosa', surname: 'Mendez', username: 'rmendez', email: 'cashier1@mcdonalds.com', phone: '55522225', role: 'CASHIER', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch1 },
            // MCDONALDS - BRANCH 2
            { _id: Ids.McDo.Users.Manager2, name: 'Ivan', surname: 'Salas', username: 'isalas', email: 'manager2@mcdonalds.com', phone: '55522226', role: 'BRANCH_MANAGER', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch2 },
            { _id: Ids.McDo.Users.Waiter2, name: 'Laura', surname: 'Vargas', username: 'lvargas', email: 'waiter2@mcdonalds.com', phone: '55522227', role: 'WAITER', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch2 },
            { _id: Ids.McDo.Users.Chef2, name: 'Julio', surname: 'Rios', username: 'jrios', email: 'chef2@mcdonalds.com', phone: '55522228', role: 'CHEF', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch2 },
            { _id: Ids.McDo.Users.Cashier2, name: 'Sara', surname: 'Vega', username: 'svega', email: 'cashier2@mcdonalds.com', phone: '55522229', role: 'CASHIER', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch2 },
            // MCDONALDS - CLIENTES
            { _id: Ids.McDo.Users.Client1, name: 'Cliente', surname: 'McDo', username: 'cmcdo', email: 'cliente@mcdonalds.com', phone: '55522230', role: 'CLIENT', status: true, companyId: mcdo._id },
            { _id: Ids.McDo.Users.Client2, name: 'Rodrigo', surname: 'Paz', username: 'rpaz', email: 'cliente.vip@mcdonalds.com', phone: '55522231', role: 'CLIENT', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch1 },
            { _id: Ids.McDo.Users.Client3, name: 'Valeria', surname: 'Solano', username: 'vsolano', email: 'cliente.frecuente@mcdonalds.com', phone: '55522232', role: 'CLIENT', status: true, companyId: mcdo._id, branchId: Ids.McDo.Branch2 }
        ];
        const allUsers = await User.insertMany(usersToInsert);

        // ═══════════════════════════════════════════════
        // INGREDIENTES
        // ═══════════════════════════════════════════════
        console.log('🍅 Creando catálogos de ingredientes...');
        const camperoIngredients = await Ingredient.insertMany([
            { companyId: campero._id, name: 'Pollo Fresco', unit: 'kg', costPrice: 20 },
            { companyId: campero._id, name: 'Papas', unit: 'kg', costPrice: 8 },
            { companyId: campero._id, name: 'Empanizado Secreto', unit: 'kg', costPrice: 15 },
            { companyId: campero._id, name: 'Aceite', unit: 'litro', costPrice: 25 },
            { companyId: campero._id, name: 'Pan', unit: 'unidad', costPrice: 2 },
            { companyId: campero._id, name: 'Frijoles', unit: 'kg', costPrice: 10 },
            { companyId: campero._id, name: 'Huevos', unit: 'docena', costPrice: 15 },
            { companyId: campero._id, name: 'Sirope Gaseosa', unit: 'litro', costPrice: 30 },
            { companyId: campero._id, name: 'Base para Helado', unit: 'litro', costPrice: 15 }
        ]);
        const mcdoIngredients = await Ingredient.insertMany([
            { companyId: mcdo._id, name: 'Carne de Res', unit: 'kg', costPrice: 35 },
            { companyId: mcdo._id, name: 'Pan de Hamburguesa', unit: 'unidad', costPrice: 3 },
            { companyId: mcdo._id, name: 'Queso Cheddar', unit: 'kg', costPrice: 40 },
            { companyId: mcdo._id, name: 'Papas Congeladas', unit: 'kg', costPrice: 12 },
            { companyId: mcdo._id, name: 'Lechuga', unit: 'kg', costPrice: 8 },
            { companyId: mcdo._id, name: 'Salsa Especial', unit: 'litro', costPrice: 20 },
            { companyId: mcdo._id, name: 'Huevos', unit: 'docena', costPrice: 15 },
            { companyId: mcdo._id, name: 'Sirope Gaseosa', unit: 'litro', costPrice: 30 },
            { companyId: mcdo._id, name: 'Pan', unit: 'unidad', costPrice: 2 },
            { companyId: mcdo._id, name: 'Base para Helado', unit: 'litro', costPrice: 15 },
            { companyId: mcdo._id, name: 'Aceite', unit: 'litro', costPrice: 25 }
        ]);

        const getIngId = (ings, name) => ings.find(i => i.name === name)._id;

        // ═══════════════════════════════════════════════
        // MENÚS
        // ═══════════════════════════════════════════════
        console.log('🍔 Creando menús y combos...');
        const createMenu = async (companyId, branchId, ings, type) => {
            const isCampero = type === 'Campero';
            // SINGLES
            const singles = await Menu.insertMany([
                // Desayuno
                { sku: 'SKU-' + Math.floor(Math.random()*100000), branch: branchId, companyId, itemType: 'SINGLE', category: 'Plato Fuerte', price: 25,
                  name: isCampero ? 'Desayuno Tradicional' : 'McMuffin de Huevo',
                  image: isCampero ? 'https://res.cloudinary.com/dueikakf8/image/upload/v1783464877/branches/menu/desayuno-super-t-pico-removebg-preview-41c7414e.png' : 'https://res.cloudinary.com/dueikakf8/image/upload/v1783466762/branches/menu/mcmuffin-de-huevo-removebg-preview-09996824.png',
                  description: isCampero ? 'Huevos, frijoles y plátanos.' : 'Muffin inglés con huevo y queso.',
                  recipe: isCampero 
                    ? [
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Huevos'), quantityRequired: 2 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Frijoles'), quantityRequired: 0.15 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Pan'), quantityRequired: 2 }
                      ]
                    : [
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Huevos'), quantityRequired: 1 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Pan'), quantityRequired: 1 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Queso Cheddar'), quantityRequired: 0.05 }
                      ] },
                // Almuerzo / Cena
                { sku: 'SKU-' + Math.floor(Math.random()*100000), branch: branchId, companyId, itemType: 'SINGLE', category: 'Plato Fuerte', price: isCampero ? 35 : 40,
                  name: isCampero ? '2 Piezas de Pollo' : 'Big Mac',
                  image: isCampero ? 'https://res.cloudinary.com/dueikakf8/image/upload/v1783465344/branches/menu/2-piezas-de-pollo-removebg-preview-7d42471b.png' : 'https://res.cloudinary.com/dueikakf8/image/upload/v1783466751/branches/menu/big-mac-removebg-preview-9e53a8e6.png',
                  description: isCampero ? '2 piezas de pollo frito tradicional.' : 'Dos tortas de carne, salsa especial, queso.',
                  recipe: isCampero 
                    ? [
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Pollo Fresco'), quantityRequired: 0.5 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Empanizado Secreto'), quantityRequired: 0.05 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Aceite'), quantityRequired: 0.1 }
                      ] 
                    : [
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Carne de Res'), quantityRequired: 0.3 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Pan de Hamburguesa'), quantityRequired: 1 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Queso Cheddar'), quantityRequired: 0.05 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Salsa Especial'), quantityRequired: 0.02 },
                        { componentType: 'Ingredient', componentId: getIngId(ings, 'Lechuga'), quantityRequired: 0.05 }
                      ] },
                // Complementos / Postres
                { sku: 'SKU-' + Math.floor(Math.random()*100000), branch: branchId, companyId, itemType: 'SINGLE', category: 'Plato Fuerte', price: 15,
                  name: 'Papas Fritas',
                  image: isCampero ? 'https://res.cloudinary.com/dueikakf8/image/upload/v1783464861/branches/menu/papas-fritas-removebg-preview-f1fa23e2.png' : 'https://res.cloudinary.com/dueikakf8/image/upload/v1783466771/branches/menu/papas-fritas-ca047f05.png',
                  description: 'Porción de papas.',
                  recipe: [
                      { componentType: 'Ingredient', componentId: getIngId(ings, isCampero ? 'Papas' : 'Papas Congeladas'), quantityRequired: 0.2 },
                      { componentType: 'Ingredient', componentId: getIngId(ings, 'Aceite'), quantityRequired: 0.05 }
                  ] },
                { sku: 'SKU-' + Math.floor(Math.random()*100000), branch: branchId, companyId, itemType: 'SINGLE', category: 'Postre', price: 12,
                  name: isCampero ? 'Helado Campero' : 'McFlurry',
                  image: isCampero ? 'https://res.cloudinary.com/dueikakf8/image/upload/v1783464352/branches/menu/helado-09ac73f7.png' : 'https://res.cloudinary.com/dueikakf8/image/upload/v1783466780/branches/menu/mcflurry-removebg-preview-589278dc.png',
                  description: 'Helado cremoso.',
                  recipe: [
                      { componentType: 'Ingredient', componentId: getIngId(ings, 'Base para Helado'), quantityRequired: 0.15 }
                  ] },
                // Bebidas
                { sku: 'SKU-' + Math.floor(Math.random()*100000), branch: branchId, companyId, itemType: 'SINGLE', category: 'Bebida', price: 10,
                  name: 'Gaseosa Mediana',
                  image: isCampero ? 'https://res.cloudinary.com/dueikakf8/image/upload/v1783464910/branches/menu/gaseosa-mediana-removebg-preview-fb4f0868.png' : 'https://res.cloudinary.com/dueikakf8/image/upload/v1783466718/branches/menu/gaseosa-mediana-18c89d41.png',
                  description: 'Bebida carbonatada.',
                  recipe: [{ componentType: 'Ingredient', componentId: getIngId(ings, 'Sirope Gaseosa'), quantityRequired: 0.1 }] }
            ]);

            // COMBOS
            const combos = await Menu.insertMany([
                { sku: 'SKU-' + Math.floor(Math.random()*100000), branch: branchId, companyId, itemType: 'COMBO', category: 'Combo', price: isCampero ? 50 : 55,
                  name: isCampero ? 'Menú Campero 2 Piezas' : 'Menú Big Mac',
                  image: isCampero ? 'https://res.cloudinary.com/dueikakf8/image/upload/v1783465324/branches/menu/men-campero-2-piezas-removebg-preview-646adc12.png' : 'https://res.cloudinary.com/dueikakf8/image/upload/v1783466740/branches/menu/men-big-mac-removebg-preview-d3cc7184.png',
                  description: 'Combo completo con bebida y papas.',
                  recipe: [
                      { componentType: 'Menu', componentId: singles[1]._id, quantityRequired: 1 }, // Plato Fuerte
                      { componentType: 'Menu', componentId: singles[2]._id, quantityRequired: 1 }, // Papas
                      { componentType: 'Menu', componentId: singles[4]._id, quantityRequired: 1 }  // Bebida
                  ]
                },
                { sku: 'SKU-' + Math.floor(Math.random()*100000), branch: branchId, companyId, itemType: 'COMBO', category: 'Combo', price: 30,
                  name: isCampero ? 'Combo Desayuno Chapín' : 'Combo McMuffin',
                  image: isCampero ? 'https://res.cloudinary.com/dueikakf8/image/upload/v1783465236/branches/menu/desayuno-campero-removebg-preview-6fb534bc.png' : 'https://res.cloudinary.com/dueikakf8/image/upload/v1783466729/branches/menu/combo-mcmuffin-removebg-preview-7fc8cc93.png',
                  description: 'Empieza tu día con este desayuno en oferta.',
                  recipe: [
                      { componentType: 'Menu', componentId: singles[0]._id, quantityRequired: 1 },
                      { componentType: 'Menu', componentId: singles[4]._id, quantityRequired: 1 }
                  ],
                  promotion: {
                      isActive: true, discountType: 'PERCENTAGE', discountValue: 20,
                      startsAt: new Date(), endsAt: new Date(Date.now() + 7*24*3600*1000)
                  }
                }
            ]);

            return { singles, combos };
        };

        const camperoMenuB1 = await createMenu(campero._id, Ids.Campero.Branch1, camperoIngredients, 'Campero');
        const camperoMenuB2 = await createMenu(campero._id, Ids.Campero.Branch2, camperoIngredients, 'Campero');
        const mcdoMenuB1 = await createMenu(mcdo._id, Ids.McDo.Branch1, mcdoIngredients, 'McDo');
        const mcdoMenuB2 = await createMenu(mcdo._id, Ids.McDo.Branch2, mcdoIngredients, 'McDo');

        // ═══════════════════════════════════════════════
        // STOCK, MESAS, ORDENES Y RESERVACIONES POR SUCURSAL
        // ═══════════════════════════════════════════════
        console.log('📦 Configurando mesas, stock, órdenes y facturas...');
        
        const setupBranchData = async (companyId, branchId, ings, menus, prefix, waiterId, cashierId) => {
            // Stock
            const stockEntries = ings.map(ing => ({
                branchId, ingredientId: ing._id, quantity: Math.floor(Math.random() * 500) + 100, minStock: 50
            }));
            await Stock.insertMany(stockEntries);

            // Mesas
            const tables = await Table.insertMany([
                { branch: branchId, companyId, number: `${prefix}01`, capacity: 2, location: 'Ventana', status: 'Disponible' },
                { branch: branchId, companyId, number: `${prefix}02`, capacity: 4, location: 'Sala Principal', status: 'Ocupada' },
                { branch: branchId, companyId, number: `${prefix}03`, capacity: 6, location: 'Terraza', status: 'Reservada' },
                { branch: branchId, companyId, number: `${prefix}04`, capacity: 4, location: 'Sala Principal', status: 'Disponible' },
            ]);

            // Órdenes
            const order1 = await Order.create({
                tables: [tables[1]._id], waiter: waiterId, branch: branchId, status: 'in-kitchen',
                items: [
                    { menuItem: menus.combos[0]._id, quantity: 2, priceAtTime: menus.combos[0].price, status: 'in-kitchen' },
                    { menuItem: menus.singles[3]._id, quantity: 1, priceAtTime: menus.singles[3].price, status: 'pending' }
                ],
                total: menus.combos[0].price * 2 + menus.singles[3].price
            });

            // Auditoria
            await OrderAudit.collection.insertMany([
                { orderId: order1._id, actorId: waiterId, actorRole: 'WAITER', actorName: 'Mesero Test', action: 'ORDER_CREATED', details: { description: 'Orden creada.' }, branchId, companyId, performedAt: new Date() }
            ]);

            // Reservaciones
            await Reservation.create({
                branch: branchId, table: tables[2]._id, date: new Date(Date.now() + 86400000), 
                status: 'Pendiente', type: 'En Mesa', notes: 'Celebración de cumpleaños',
                guestsCount: 4, guestName: 'Cliente Test'
            });

            // Factura
            await Invoice.create({
                invoiceNumber: `F-${prefix}-${Math.floor(Math.random()*1000)}`,
                orderId: order1._id, branchId, companyId, billedBy: cashierId,
                itemsSnapshot: [{ menuItemName: 'Combo x2', quantity: 2, priceAtTime: 50, subtotal: 100 }],
                subtotal: order1.total, totalAmount: order1.total, status: 'DRAFT'
            });
        };

        await setupBranchData(campero._id, Ids.Campero.Branch1, camperoIngredients, camperoMenuB1, 'C1', Ids.Campero.Users.Waiter1, Ids.Campero.Users.Cashier1);
        await setupBranchData(campero._id, Ids.Campero.Branch2, camperoIngredients, camperoMenuB2, 'C2', Ids.Campero.Users.Waiter2, Ids.Campero.Users.Cashier2);
        await setupBranchData(mcdo._id, Ids.McDo.Branch1, mcdoIngredients, mcdoMenuB1, 'M1', Ids.McDo.Users.Waiter1, Ids.McDo.Users.Cashier1);
        await setupBranchData(mcdo._id, Ids.McDo.Branch2, mcdoIngredients, mcdoMenuB2, 'M2', Ids.McDo.Users.Waiter2, Ids.McDo.Users.Cashier2);

        console.log('\n✅ ¡Mega-Seeder completado con éxito!');
        console.log('Se generaron datos extensivos para Pollo Campero y Mc Donalds.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en el seeder:', error);
        process.exit(1);
    }
};

seedDatabase();
