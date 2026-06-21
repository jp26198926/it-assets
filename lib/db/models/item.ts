import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IItem extends Omit<Document, "model">, BaseAuditFields {
  name: string;
  category_id: mongoose.Types.ObjectId | null;
  brand: string | null;
  model: string | null;
  description: string | null;
  uom_id: mongoose.Types.ObjectId | null;
  minimum_stock: number;
  image_url: string | null;
  status: "Active" | "Deleted";
}

const ItemSchema = new Schema<IItem>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  brand: {
    type: String,
    default: null,
  },
  model: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  uom_id: {
    type: Schema.Types.ObjectId,
    ref: "UOM",
    default: null,
  },
  minimum_stock: {
    type: Number,
    default: 0,
  },
  image_url: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Deleted"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

ItemSchema.index({ name: 1 }, { unique: true });
ItemSchema.index({ category_id: 1 });
ItemSchema.index({ uom_id: 1 });
ItemSchema.index({ status: 1 });

export const Item =
  mongoose.models.Item ||
  mongoose.model<IItem>("Item", ItemSchema, "items");
