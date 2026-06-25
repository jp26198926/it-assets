import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ITicketComment extends Document, BaseAuditFields {
  ticket_id: mongoose.Types.ObjectId;
  replied_to: mongoose.Types.ObjectId | null;
  message: string;
  attachments: string[];
}

const TicketCommentSchema = new Schema<ITicketComment>({
  ticket_id: {
    type: Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  replied_to: {
    type: Schema.Types.ObjectId,
    ref: "TicketComment",
    default: null,
  },
  message: {
    type: String,
    required: true,
  },
  attachments: {
    type: [String],
    default: [],
  },
  ...BaseAuditSchemaDefinition,
});

TicketCommentSchema.index({ ticket_id: 1, created_at: 1 });
TicketCommentSchema.index({ replied_to: 1 });

export const TicketComment =
  mongoose.models.TicketComment ||
  mongoose.model<ITicketComment>("TicketComment", TicketCommentSchema, "ticket_comments");
