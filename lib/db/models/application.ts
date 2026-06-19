import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IApplication extends Document, BaseAuditFields {
  app_name: string;
  tagline: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tin_number: string | null;
  otp_expiry_duration: number;
  android_download_link: string | null;
  ios_download_link: string | null;
  facebook_link: string | null;
  x_link: string | null;
  instagram_link: string | null;
}

const ApplicationSchema = new Schema<IApplication>({
  app_name: {
    type: String,
    default: "",
  },
  tagline: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  tin_number: {
    type: String,
    default: null,
  },
  otp_expiry_duration: {
    type: Number,
    default: 5,
  },
  android_download_link: {
    type: String,
    default: null,
  },
  ios_download_link: {
    type: String,
    default: null,
  },
  facebook_link: {
    type: String,
    default: null,
  },
  x_link: {
    type: String,
    default: null,
  },
  instagram_link: {
    type: String,
    default: null,
  },
  ...BaseAuditSchemaDefinition,
});

export const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema, "applications");
