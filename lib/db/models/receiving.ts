import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IReceiving extends Document, BaseAuditFields {
  code: string;
  date_received: Date;
  supplier_id: mongoose.Types.ObjectId | null;
  po_number: string | null;
  invoice_number: string | null;
  remarks: string | null;
  status: "Active" | "Completed" | "Cancelled";
}

const ReceivingSchema = new Schema<IReceiving>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  date_received: {
    type: Date,
    required: true,
  },
  supplier_id: {
    type: Schema.Types.ObjectId,
    ref: "Supplier",
    default: null,
  },
  po_number: {
    type: String,
    default: null,
  },
  invoice_number: {
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
    enum: ["Active", "Completed", "Cancelled"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

ReceivingSchema.index({ status: 1 });
ReceivingSchema.index({ supplier_id: 1 });
ReceivingSchema.index({ date_received: -1 });

export const Receiving =
  mongoose.models.Receiving ||
  mongoose.model<IReceiving>("Receiving", ReceivingSchema, "receivings");
