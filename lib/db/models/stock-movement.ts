import mongoose, { Schema, Document } from "mongoose";

export interface IStockMovement extends Document {
  date: Date;
  transaction_type: "RECEIVE" | "RELEASE" | "ADJUSTMENT" | "TRANSFER" | "CONVERSION";
  item_id: mongoose.Types.ObjectId;
  location_id: mongoose.Types.ObjectId;
  qty: number;
  reference_trans_id: mongoose.Types.ObjectId;
  reference_item_id: mongoose.Types.ObjectId;
  reference_description: string | null;
  remarks: string | null;
}

const StockMovementSchema = new Schema<IStockMovement>({
  date: {
    type: Date,
    required: true,
  },
  transaction_type: {
    type: String,
    required: true,
    enum: ["RECEIVE", "RELEASE", "ADJUSTMENT", "TRANSFER", "CONVERSION"],
  },
  item_id: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  reference_trans_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  reference_item_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  reference_description: {
    type: String,
    default: null,
  },
  remarks: {
    type: String,
    default: null,
  },
});

StockMovementSchema.index({ item_id: 1 });
StockMovementSchema.index({ location_id: 1 });
StockMovementSchema.index({ date: -1 });
StockMovementSchema.index({ reference_trans_id: 1 });

export const StockMovement =
  mongoose.models.StockMovement ||
  mongoose.model<IStockMovement>("StockMovement", StockMovementSchema, "stock_movements");
