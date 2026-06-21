import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IPage extends Document, BaseAuditFields {
  name: string;
  description: string | null;
  path: string;
  icon: string;
  parent_id: Types.ObjectId | null;
  section: string | null;
  order: number;
  status: "Active" | "Deleted";
}

const PageSchema = new Schema<IPage>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: null,
  },
  path: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: "Page",
    default: null,
  },
  section: {
    type: String,
    default: null,
  },
  order: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Deleted"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

PageSchema.index({ name: 1 }, { unique: true });
PageSchema.index({ parent_id: 1 });
PageSchema.index({ status: 1 });
PageSchema.index({ order: 1 });

export const Page =
  mongoose.models.Page ||
  mongoose.model<IPage>("Page", PageSchema, "pages");
