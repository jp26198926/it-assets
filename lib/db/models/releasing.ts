import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IReleasing extends Document, BaseAuditFields {
  code: string;
  date_released: Date;
  from_location_id: mongoose.Types.ObjectId | null;
  to_department_id: mongoose.Types.ObjectId | null;
  remarks: string | null;
  status: "Active" | "Completed" | "Cancelled";
}

const ReleasingSchema = new Schema<IReleasing>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  date_released: {
    type: Date,
    required: true,
  },
  from_location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    default: null,
  },
  to_department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
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

ReleasingSchema.index({ code: 1 }, { unique: true });
ReleasingSchema.index({ status: 1 });
ReleasingSchema.index({ from_location_id: 1 });
ReleasingSchema.index({ to_department_id: 1 });
ReleasingSchema.index({ date_released: -1 });

export const Releasing =
  mongoose.models.Releasing ||
  mongoose.model<IReleasing>("Releasing", ReleasingSchema, "releasings");
