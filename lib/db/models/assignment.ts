import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IAssignment extends Document, BaseAuditFields {
  asset_id: mongoose.Types.ObjectId;
  employee_id: mongoose.Types.ObjectId | null;
  department_id: mongoose.Types.ObjectId | null;
  location_id: mongoose.Types.ObjectId | null;
  assigned_date: Date;
  returned_date: Date | null;
  condition_on_issue: string;
  condition_on_return: string | null;
  remarks: string | null;
  status: "Active" | "Returned" | "Lost";
  date_lost: Date | null;
  lost_reason: string | null;
}

const AssignmentSchema = new Schema<IAssignment>({
  asset_id: {
    type: Schema.Types.ObjectId,
    ref: "Asset",
    required: true,
  },
  employee_id: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },
  location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    default: null,
  },
  assigned_date: {
    type: Date,
    required: true,
  },
  returned_date: {
    type: Date,
    default: null,
  },
  condition_on_issue: {
    type: String,
    required: true,
  },
  condition_on_return: {
    type: String,
    default: null,
  },
  remarks: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Returned", "Lost"],
    default: "Active",
  },
  date_lost: {
    type: Date,
    default: null,
  },
  lost_reason: {
    type: String,
    default: null,
  },
  ...BaseAuditSchemaDefinition,
});

AssignmentSchema.index({ asset_id: 1 });
AssignmentSchema.index({ employee_id: 1 });
AssignmentSchema.index({ department_id: 1 });
AssignmentSchema.index({ location_id: 1 });
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ created_at: -1 });

export const Assignment =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>("Assignment", AssignmentSchema, "assignments");
