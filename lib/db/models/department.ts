import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IDepartment extends Document, BaseAuditFields {
  code: string;
  name: string;
  description: string | null;
  status_id: Types.ObjectId;
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
  status_id: {
    type: Schema.Types.ObjectId,
    ref: "DepartmentStatus",
    required: true,
  },
  ...BaseAuditSchemaDefinition,
});

DepartmentSchema.index({ code: 1 }, { unique: true });
DepartmentSchema.index({ name: 1 }, { unique: true });
DepartmentSchema.index({ status_id: 1 });

export const Department =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema, "departments");
