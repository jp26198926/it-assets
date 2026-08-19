import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ITransferItem extends Document, BaseAuditFields {
  code: string;
  transfer_id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
  qty: number;
  remarks: string | null;
  status: "Active" | "Completed" | "Cancelled";
}

const TransferItemSchema = new Schema<ITransferItem>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  transfer_id: {
    type: Schema.Types.ObjectId,
    ref: "Transfer",
    required: true,
  },
  item_id: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  qty: {
    type: Number,
    default: 0,
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

TransferItemSchema.index({ transfer_id: 1 });
TransferItemSchema.index({ item_id: 1 });
TransferItemSchema.index({ status: 1 });

export const TransferItem =
  mongoose.models.TransferItem ||
  mongoose.model<ITransferItem>("TransferItem", TransferItemSchema, "transfer_items");
