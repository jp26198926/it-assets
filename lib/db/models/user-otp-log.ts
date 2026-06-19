import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserOtpLog extends Document {
  user_id: Types.ObjectId;
  otp_code: string;
  purpose: "REGISTER" | "LOGIN" | "RESET_PASSWORD" | "EMAIL_CHANGE" | "PHONE_CHANGE";
  sent_at: Date;
  expires_at: Date;
  verified_at: Date | null;
  attempt_count: number;
  status: "ACTIVE" | "USED" | "EXPIRED";
}

const UserOtpLogSchema = new Schema<IUserOtpLog>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp_code: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["REGISTER", "LOGIN", "RESET_PASSWORD", "EMAIL_CHANGE", "PHONE_CHANGE"],
    required: true,
  },
  sent_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  verified_at: {
    type: Date,
    default: null,
  },
  attempt_count: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "USED", "EXPIRED"],
    default: "ACTIVE",
  },
});

UserOtpLogSchema.index({ user_id: 1 });
UserOtpLogSchema.index({ user_id: 1, purpose: 1, status: 1 });

export const UserOtpLog =
  mongoose.models.UserOtpLog ||
  mongoose.model<IUserOtpLog>("UserOtpLog", UserOtpLogSchema, "user_otp_logs");
