import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IRole extends Document, BaseAuditFields {
  name: string;
  description: string | null;
  status_id: Types.ObjectId;
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: null,
  },
  status_id: {
    type: Schema.Types.ObjectId,
    ref: "RoleStatus",
    required: true,
  },
  ...BaseAuditSchemaDefinition,
});

RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ status_id: 1 });

export const Role =
  mongoose.models.Role ||
  mongoose.model<IRole>("Role", RoleSchema, "roles");
