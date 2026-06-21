import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ICategory extends Document, BaseAuditFields {
  name: string;
  type: "Inventoriable" | "Consumable";
  description: string | null;
  status: "Active" | "Deleted";
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["Inventoriable", "Consumable"],
    default: "Inventoriable",
  },
  description: {
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

CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ type: 1 });
CategorySchema.index({ status: 1 });

export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema, "categories");
