import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IConversion extends Document, BaseAuditFields {
  code: string;
  date_converted: Date;
  location_id: mongoose.Types.ObjectId;
  from_item_id: mongoose.Types.ObjectId;
  to_item_id: mongoose.Types.ObjectId;
  from_qty: number;
  to_qty: number;
  remarks: string | null;
}

const ConversionSchema = new Schema<IConversion>({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  date_converted: {
    type: Date,
    required: true,
  },
  location_id: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  from_item_id: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  to_item_id: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  from_qty: {
    type: Number,
    required: true,
  },
  to_qty: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
    default: null,
  },
  ...BaseAuditSchemaDefinition,
});

ConversionSchema.index({ code: 1 }, { unique: true });
ConversionSchema.index({ location_id: 1 });
ConversionSchema.index({ from_item_id: 1 });
ConversionSchema.index({ to_item_id: 1 });
ConversionSchema.index({ date_converted: -1 });

export const Conversion =
  mongoose.models.Conversion ||
  mongoose.model<IConversion>("Conversion", ConversionSchema, "conversions");
