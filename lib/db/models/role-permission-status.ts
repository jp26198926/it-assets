import mongoose, { Schema, Document } from "mongoose";

export interface IRolePermissionStatus extends Document {
  status: string;
}

const RolePermissionStatusSchema = new Schema<IRolePermissionStatus>({
  status: {
    type: String,
    required: true,
  },
});

export const RolePermissionStatus =
  mongoose.models.RolePermissionStatus ||
  mongoose.model<IRolePermissionStatus>("RolePermissionStatus", RolePermissionStatusSchema, "role_permission_statuses");
