import mongoose, { Schema, Document } from "mongoose";

export interface IPermissionStatus extends Document {
  status: string;
}

const PermissionStatusSchema = new Schema<IPermissionStatus>({
  status: {
    type: String,
    required: true,
  },
});

export const PermissionStatus =
  mongoose.models.PermissionStatus ||
  mongoose.model<IPermissionStatus>("PermissionStatus", PermissionStatusSchema, "permission_statuses");
