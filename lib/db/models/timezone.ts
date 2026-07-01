import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ITimezone extends Document, BaseAuditFields {
  name: string;
  display_name: string;
  status: "Active" | "Deleted";
}

const TimezoneSchema = new Schema<ITimezone>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  display_name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Deleted"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

export const Timezone =
  mongoose.models.Timezone ||
  mongoose.model<ITimezone>("Timezone", TimezoneSchema, "timezones");
