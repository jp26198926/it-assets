import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IReceivingItem extends Document, BaseAuditFields {
  code: string;
  receiving_id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
  qty: number;
  unit_price: number;
  total_cost: number;
  expiration_date: Date | null;
  remarks: string | null;
  storage_location_id: mongoose.Types.ObjectId | null;
  status: "Active" | "Completed" | "Cancelled";
}

const ReceivingItemSchema = new Schema<IReceivingItem>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  receiving_id: {
    type: Schema.Types.ObjectId,
    ref: "Receiving",
    required: true,
  },
  item_id: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  qty: {
    type: Number,
    default: 0,
  },
  unit_price: {
    type: Number,
    default: 0,
  },
  total_cost: {
    type: Number,
    default: 0,
  },
  expiration_date: {
    type: Date,
    default: null,
  },
  remarks: {
    type: String,
    default: null,
  },
  storage_location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Completed", "Cancelled"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

ReceivingItemSchema.index({ receiving_id: 1 });
ReceivingItemSchema.index({ item_id: 1 });
ReceivingItemSchema.index({ status: 1 });

export const ReceivingItem =
  mongoose.models.ReceivingItem ||
  mongoose.model<IReceivingItem>("ReceivingItem", ReceivingItemSchema, "receiving_items");
