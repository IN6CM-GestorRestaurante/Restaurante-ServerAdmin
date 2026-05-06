import mongoose, { Schema, model } from "mongoose";

const InvoiceSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },
    billedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    itemsSnapshot: [
      {
        menuItemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        priceAtTime: { type: Number, required: true },
        subtotal: { type: Number, required: true }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "TRANSFER"],
      default: "CASH"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Las facturas en un ERP deben ser inmutables a nivel esquema Mongoose pre-hooks.
InvoiceSchema.pre('updateOne', function (next) {
  next(new Error("Legal Constraint: No se pueden modificar facturas emitidas."));
});
InvoiceSchema.pre('updateMany', function (next) {
  next(new Error("Legal Constraint: No se pueden modificar facturas emitidas."));
});
InvoiceSchema.pre('findOneAndUpdate', function (next) {
  next(new Error("Legal Constraint: No se pueden modificar facturas emitidas."));
});
InvoiceSchema.pre('deleteOne', function (next) {
  next(new Error("Legal Constraint: No se pueden eliminar facturas. Cancela la orden vinculada en su lugar usando Notas de Crédito."));
});
InvoiceSchema.pre('deleteMany', function (next) {
  next(new Error("Legal Constraint: No se pueden eliminar facturas emitidas."));
});
InvoiceSchema.pre('findOneAndDelete', function (next) {
  next(new Error("Legal Constraint: No se pueden eliminar facturas."));
});

export default model("Invoice", InvoiceSchema);
