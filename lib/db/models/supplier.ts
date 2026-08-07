import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ISupplier extends Document, BaseAuditFields {
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: "Active" | "Deleted";
}

const SupplierSchema = new Schema<ISupplier>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  contact_person: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  address: {
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

SupplierSchema.index({ name: 1 }, { unique: true });
SupplierSchema.index({ status: 1 });

export const Supplier =
  mongoose.models.Supplier ||
  mongoose.model<ISupplier>("Supplier", SupplierSchema, "suppliers");
