import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IAdjustment extends Document, BaseAuditFields {
  code: string;
  date_adjusted: Date;
  location_id: mongoose.Types.ObjectId;
  item_id: mongoose.Types.ObjectId;
  qty: number;
  remarks: string | null;
}

const AdjustmentSchema = new Schema<IAdjustment>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  date_adjusted: {
    type: Date,
    required: true,
  },
  location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  item_id: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
    default: null,
  },
  ...BaseAuditSchemaDefinition,
});

AdjustmentSchema.index({ code: 1 }, { unique: true });
AdjustmentSchema.index({ location_id: 1 });
AdjustmentSchema.index({ item_id: 1 });
AdjustmentSchema.index({ date_adjusted: -1 });

export const Adjustment =
  mongoose.models.Adjustment ||
  mongoose.model<IAdjustment>("Adjustment", AdjustmentSchema, "adjustments");
