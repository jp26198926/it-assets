import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ILocation extends Document, BaseAuditFields {
  name: string;
  status: "Active" | "Deleted";
}

const LocationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Deleted"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

LocationSchema.index({ name: 1 }, { unique: true });
LocationSchema.index({ status: 1 });

export const Location =
  mongoose.models.Location ||
  mongoose.model<ILocation>("Location", LocationSchema, "locations");
