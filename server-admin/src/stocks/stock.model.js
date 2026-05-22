import mongoose from 'mongoose';

const StockSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'Branch' },
  ingredientId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'Ingredient' },
  quantity: { type: Number, required: true, min: 0 },   // Existencia física real
  reserved: { type: Number, required: true, default: 0, min: 0 }, // Inventario en Stash (Comandado)
  minStock: { type: Number, required: true, default: 0 }
}, { collection: 'stocks', timestamps: true, autoIndex: false });

StockSchema.index({ branchId: 1, ingredientId: 1 }, { unique: true });

export const Stock = mongoose.model('Stock', StockSchema);
export default Stock;
