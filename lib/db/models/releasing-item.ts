import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IReleasingItem extends Document, BaseAuditFields {
  code: string;
  releasing_id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
  qty: number;
  from_location_id: mongoose.Types.ObjectId | null;
  remarks: string | null;
  status: "Active" | "Completed" | "Cancelled";
}

const ReleasingItemSchema = new Schema<IReleasingItem>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  releasing_id: {
    type: Schema.Types.ObjectId,
    ref: "Releasing",
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
  from_location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    default: null,
  },
  remarks: {
    type: String,
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

ReleasingItemSchema.index({ code: 1 }, { unique: true });
ReleasingItemSchema.index({ releasing_id: 1 });
ReleasingItemSchema.index({ item_id: 1 });
ReleasingItemSchema.index({ status: 1 });

export const ReleasingItem =
  mongoose.models.ReleasingItem ||
  mongoose.model<IReleasingItem>("ReleasingItem", ReleasingItemSchema, "releasing_items");
