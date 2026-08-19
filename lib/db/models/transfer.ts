import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ITransfer extends Document, BaseAuditFields {
  code: string;
  date_transferred: Date;
  from_location_id: mongoose.Types.ObjectId;
  to_location_id: mongoose.Types.ObjectId;
  remarks: string | null;
  status: "Active" | "Completed" | "Cancelled";
}

const TransferSchema = new Schema<ITransfer>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  date_transferred: {
    type: Date,
    required: true,
  },
  from_location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  to_location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
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

TransferSchema.index({ status: 1 });
TransferSchema.index({ from_location_id: 1 });
TransferSchema.index({ to_location_id: 1 });
TransferSchema.index({ date_transferred: -1 });

export const Transfer =
  mongoose.models.Transfer ||
  mongoose.model<ITransfer>("Transfer", TransferSchema, "transfers");
