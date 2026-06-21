import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IDepartment extends Document, BaseAuditFields {
  code: string;
  name: string;
  description: string | null;
  status: "Active" | "Deleted";
}

const DepartmentSchema = new Schema<IDepartment>({
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

DepartmentSchema.index({ code: 1 }, { unique: true });
DepartmentSchema.index({ name: 1 }, { unique: true });
DepartmentSchema.index({ status: 1 });

export const Department =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema, "departments");
