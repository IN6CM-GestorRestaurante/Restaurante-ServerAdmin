import mongoose from 'mongoose';
import Stock from './stock.model.js';
import Menu from '../menus/menu.model.js';

/**
 * Gestiona la deducción o restauración de inventario basada en los ítems de una orden.
 * 
 * @param {string} branchId - ID de la sucursal donde se opera.
 * @param {Array} items - Arreglo de ítems [{ menuItem, quantity }].
 * @param {string} mode - 'DEDUCT' para restar, 'RESTORE' para sumar.
 * @author Antigravity
 */
const processStockUpdate = async (branchId, items, mode = 'DEDUCT') => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const isDeduct = mode === 'DEDUCT';
        
        // 1. Obtener recetas de todos los platillos
        const menuItemIds = items.map(i => i.menuItem);
        const menus = await Menu.find({ _id: { $in: menuItemIds } })
            .select('name recipe')
            .populate('recipe.ingredientId', 'name unit')
            .session(session);

        // 2. Calcular demanda consolidada por ingrediente
        const demand = new Map();
        for (const item of items) {
            const menu = menus.find(m => m._id.toString() === item.menuItem.toString());
            if (!menu || !menu.recipe?.length) continue;

            for (const recipeItem of menu.recipe) {
                const ingId = recipeItem.ingredientId._id.toString();
                const needed = recipeItem.quantityRequired * item.quantity;
                const current = demand.get(ingId) || { 
                    totalAmount: 0, 
                    name: recipeItem.ingredientId.name 
                };
                current.totalAmount += needed;
                demand.set(ingId, current);
            }
        }

        // 3. Validar y actualizar stock
        const insufficientItems = [];
        for (const [ingredientId, { totalAmount, name }] of demand) {
            const stock = await Stock.findOne({ branchId, ingredientId }).session(session);

            if (isDeduct) {
                if (!stock || stock.quantity < totalAmount) {
                    insufficientItems.push({
                        ingredient: name,
                        available: stock?.quantity || 0,
                        needed: totalAmount
                    });
                    continue;
                }
                stock.quantity -= totalAmount;
            } else {
                if (stock) {
                    stock.quantity += totalAmount;
                }
            }

            if (stock) {
                await stock.save({ session });
                // Alerta de stock bajo
                if (isDeduct && stock.quantity <= stock.minStock) {
                    console.warn(`[Inventory Alert] Stock bajo: ${name} en sucursal ${branchId}. Quedan: ${stock.quantity}`);
                }
            }
        }

        if (insufficientItems.length > 0) {
            await session.abortTransaction();
            const detail = insufficientItems.map(i => `${i.ingredient}: necesitas ${i.needed}, hay ${i.available}`).join('; ');
            throw new Error(`Stock insuficiente: ${detail}`);
        }

        await session.commitTransaction();
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Descuenta ingredientes del stock para una lista de items de orden.
 * @param {string} branchId 
 * @param {Array} items 
 */
export const deductStockForItems = async (branchId, items) => {
    return await processStockUpdate(branchId, items, 'DEDUCT');
};

/**
 * Restaura stock cuando se cancela una orden o un ítem.
 * @param {string} branchId 
 * @param {Array} items 
 */
export const restoreStockForItems = async (branchId, items) => {
    return await processStockUpdate(branchId, items, 'RESTORE');
};
