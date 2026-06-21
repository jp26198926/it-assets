import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IEmployee extends Document, BaseAuditFields {
  emp_no: string | null;
  firstname: string;
  middlename: string | null;
  lastname: string;
  email: string | null;
  contact_no: string | null;
  department_id: mongoose.Types.ObjectId | null;
  status: "Active" | "Deleted";
}

const EmployeeSchema = new Schema<IEmployee>({
  emp_no: {
    type: String,
    default: null,
  },
  firstname: {
    type: String,
    required: true,
  },
  middlename: {
    type: String,
    default: null,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: null,
  },
  contact_no: {
    type: String,
    default: null,
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
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

EmployeeSchema.index({ department_id: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ lastname: 1, firstname: 1 });

export const Employee =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema, "employees");
