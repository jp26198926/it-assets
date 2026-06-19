import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IUser extends Document, BaseAuditFields {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: boolean;
  phone_verified_at: Date | null;
  department_id: Types.ObjectId | null;
  email_verified_at: Date | null;
  is_verified: boolean;
  role_id: Types.ObjectId;
  status_id: Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  phone_verified: {
    type: Boolean,
    default: false,
  },
  phone_verified_at: {
    type: Date,
    default: null,
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },
  email_verified_at: {
    type: Date,
    default: null,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  role_id: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  status_id: {
    type: Schema.Types.ObjectId,
    ref: "UserStatus",
    required: true,
  },
  ...BaseAuditSchemaDefinition,
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ department_id: 1 });
UserSchema.index({ role_id: 1 });
UserSchema.index({ status_id: 1 });

export const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema, "users");
