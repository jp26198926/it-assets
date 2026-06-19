import mongoose, { Schema, Document } from "mongoose";

export interface IUserStatus extends Document {
  status: string;
}

const UserStatusSchema = new Schema<IUserStatus>({
  status: {
    type: String,
    required: true,
  },
});

export const UserStatus =
  mongoose.models.UserStatus ||
  mongoose.model<IUserStatus>("UserStatus", UserStatusSchema, "user_statuses");
