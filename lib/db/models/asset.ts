import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IAsset extends Omit<Document, "model">, BaseAuditFields {
  item_id: mongoose.Types.ObjectId | null;
  barcode: string;
  serial_number: string | null;
  remarks: string | null;
  date_received: Date | null;
  purchase_date: Date | null;
  purchase_price: number | null;
  warranty_expiry: Date | null;
  location_id: mongoose.Types.ObjectId | null;
  assigned_to_employee: mongoose.Types.ObjectId | null;
  assigned_to_department: mongoose.Types.ObjectId | null;
  status: "Available" | "Assigned" | "Repair" | "Lost" | "Disposed" | "Deleted";
}

const AssetSchema = new Schema<IAsset>({
  item_id: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    default: null,
  },
  barcode: {
    type: String,
    required: true,
    unique: true,
  },
  serial_number: {
    type: String,
    default: null,
  },
  remarks: {
    type: String,
    default: null,
  },
  date_received: {
    type: Date,
    default: null,
  },
  purchase_date: {
    type: Date,
    default: null,
  },
  purchase_price: {
    type: Number,
    default: null,
  },
  warranty_expiry: {
    type: Date,
    default: null,
  },
  location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    default: null,
  },
  assigned_to_employee: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  assigned_to_department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Assigned", "Repair", "Lost", "Disposed", "Deleted"],
    default: "Available",
  },
  ...BaseAuditSchemaDefinition,
});

AssetSchema.index({ barcode: 1 }, { unique: true });
AssetSchema.index({ item_id: 1 });
AssetSchema.index({ location_id: 1 });
AssetSchema.index({ assigned_to_employee: 1 });
AssetSchema.index({ assigned_to_department: 1 });
AssetSchema.index({ status: 1 });

export const Asset =
  mongoose.models.Asset ||
  mongoose.model<IAsset>("Asset", AssetSchema, "assets");
