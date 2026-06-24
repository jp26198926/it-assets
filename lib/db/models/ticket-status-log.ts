import mongoose, { Schema, Document } from "mongoose";

export interface ITicketStatusLog extends Document {
  ticket_id: mongoose.Types.ObjectId;
  old_status: string;
  new_status: string;
  remarks: string;
  created_at: Date;
  created_by: mongoose.Types.ObjectId | null;
}

const TicketStatusLogSchema = new Schema<ITicketStatusLog>({
  ticket_id: {
    type: Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  old_status: {
    type: String,
    required: true,
  },
  new_status: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
    default: "",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

TicketStatusLogSchema.index({ ticket_id: 1 });

export const TicketStatusLog =
  mongoose.models.TicketStatusLog ||
  mongoose.model<ITicketStatusLog>("TicketStatusLog", TicketStatusLogSchema, "ticket_status_logs");
