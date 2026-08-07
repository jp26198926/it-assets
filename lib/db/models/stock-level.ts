import mongoose, { Schema, Document } from "mongoose";

export interface IStockLevel extends Document {
  item_id: mongoose.Types.ObjectId;
  location_id: mongoose.Types.ObjectId;
  qty: number;
}

const StockLevelSchema = new Schema<IStockLevel>({
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
    default: 0,
  },
});

StockLevelSchema.index({ item_id: 1, location_id: 1 }, { unique: true });
StockLevelSchema.index({ item_id: 1 });
StockLevelSchema.index({ location_id: 1 });

export const StockLevel =
  mongoose.models.StockLevel ||
  mongoose.model<IStockLevel>("StockLevel", StockLevelSchema, "stock_levels");
