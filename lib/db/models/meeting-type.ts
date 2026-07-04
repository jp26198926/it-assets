import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IMeetingType extends Document, BaseAuditFields {
  name: string;
  description: string | null;
  color: string | null;
  status: "Active" | "Deleted";
}

const MeetingTypeSchema = new Schema<IMeetingType>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: null,
  },
  color: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["Active", "Deleted"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

MeetingTypeSchema.index({ name: 1 }, { unique: true });
MeetingTypeSchema.index({ status: 1 });

export const MeetingType =
  mongoose.models.MeetingType ||
  mongoose.model<IMeetingType>("MeetingType", MeetingTypeSchema, "meeting_types");
