import mongoose, { Schema, Document } from "mongoose";

export interface IRoleStatus extends Document {
  status: string;
}

const RoleStatusSchema = new Schema<IRoleStatus>({
  status: {
    type: String,
    required: true,
  },
});

export const RoleStatus =
  mongoose.models.RoleStatus ||
  mongoose.model<IRoleStatus>("RoleStatus", RoleStatusSchema, "role_statuses");
