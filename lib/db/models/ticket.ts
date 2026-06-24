import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ITicket extends Document, BaseAuditFields {
  ticket_no: string;
  name: string;
  email: string;
  requestor_id: Types.ObjectId | null;
  title: string;
  description: string;
  category_id: Types.ObjectId;
  department_id: Types.ObjectId | null;
  priority: "Low" | "Medium" | "High" | "Critical";
  asset_id: Types.ObjectId | null;
  assigned_to: Types.ObjectId | null;
  attachments: string[];
  status: "Open" | "In Progress" | "Resolved" | "Closed" | "Deleted";
}

const TicketSchema = new Schema<ITicket>({
  ticket_no: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  requestor_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "TicketCategory",
    required: true,
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },
  priority: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Low",
  },
  asset_id: {
    type: Schema.Types.ObjectId,
    ref: "Asset",
    default: null,
  },
  assigned_to: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  attachments: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    required: true,
    enum: ["Open", "In Progress", "Resolved", "Closed", "Deleted"],
    default: "Open",
  },
  ...BaseAuditSchemaDefinition,
});

TicketSchema.index({ ticket_no: 1 }, { unique: true });
TicketSchema.index({ email: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ category_id: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ assigned_to: 1 });
TicketSchema.index({ department_id: 1 });

export const Ticket =
  mongoose.models.Ticket ||
  mongoose.model<ITicket>("Ticket", TicketSchema, "tickets");
