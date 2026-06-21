import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IUOM extends Document, BaseAuditFields {
  code: string;
  name: string;
  status: "Active" | "Deleted";
}

const UOMSchema = new Schema<IUOM>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Deleted"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

UOMSchema.index({ code: 1 }, { unique: true });
UOMSchema.index({ name: 1 }, { unique: true });
UOMSchema.index({ status: 1 });

export const UOM =
  mongoose.models.UOM ||
  mongoose.model<IUOM>("UOM", UOMSchema, "uoms");
