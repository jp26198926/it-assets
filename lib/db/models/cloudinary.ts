import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ICloudinary extends Document, BaseAuditFields {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  max_file_size: number;
}

const CloudinarySchema = new Schema<ICloudinary>({
  cloud_name: {
    type: String,
    default: "",
  },
  api_key: {
    type: String,
    default: "",
  },
  api_secret: {
    type: String,
    default: "",
  },
  max_file_size: {
    type: Number,
    default: 10,
  },
  ...BaseAuditSchemaDefinition,
});

export const Cloudinary =
  mongoose.models.Cloudinary ||
  mongoose.model<ICloudinary>("Cloudinary", CloudinarySchema, "cloudinary");
