import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IMail extends Document, BaseAuditFields {
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass: string;
  smtp_from: string;
  sender_name: string;
}

const MailSchema = new Schema<IMail>({
  smtp_host: {
    type: String,
    default: "",
  },
  smtp_port: {
    type: Number,
    default: 587,
  },
  smtp_secure: {
    type: Boolean,
    default: false,
  },
  smtp_user: {
    type: String,
    default: "",
  },
  smtp_pass: {
    type: String,
    default: "",
  },
  smtp_from: {
    type: String,
    default: "",
  },
  sender_name: {
    type: String,
    default: "",
  },
  ...BaseAuditSchemaDefinition,
});

export const Mail =
  mongoose.models.Mail ||
  mongoose.model<IMail>("Mail", MailSchema, "mails");
