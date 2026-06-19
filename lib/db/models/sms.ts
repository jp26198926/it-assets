import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ISms extends Document, BaseAuditFields {
  api_key: string;
  device_id: string;
}

const SmsSchema = new Schema<ISms>({
  api_key: {
    type: String,
    default: "",
  },
  device_id: {
    type: String,
    default: "",
  },
  ...BaseAuditSchemaDefinition,
});

export const Sms =
  mongoose.models.Sms ||
  mongoose.model<ISms>("Sms", SmsSchema, "sms");
