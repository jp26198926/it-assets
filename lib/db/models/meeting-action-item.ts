import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IMeetingActionItem extends Document, BaseAuditFields {
  meeting_id: Types.ObjectId;
  title: string;
  description: string | null;
  assigned_to: Types.ObjectId | null;
  due_date: Date | null;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed" | "Cancelled" | "Deleted";
  completed_at: Date | null;
  completed_by: Types.ObjectId | null;
}

const MeetingActionItemSchema = new Schema<IMeetingActionItem>({
  meeting_id: {
    type: Schema.Types.ObjectId,
    ref: "Meeting",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  assigned_to: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  due_date: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Cancelled", "Deleted"],
    default: "Pending",
  },
  completed_at: {
    type: Date,
    default: null,
  },
  completed_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  ...BaseAuditSchemaDefinition,
});

MeetingActionItemSchema.index({ meeting_id: 1 });
MeetingActionItemSchema.index({ assigned_to: 1 });
MeetingActionItemSchema.index({ status: 1 });
MeetingActionItemSchema.index({ due_date: 1 });
MeetingActionItemSchema.index({ created_at: -1 });

export const MeetingActionItem =
  mongoose.models.MeetingActionItem ||
  mongoose.model<IMeetingActionItem>(
    "MeetingActionItem",
    MeetingActionItemSchema,
    "meeting_action_items"
  );
