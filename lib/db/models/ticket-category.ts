import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ITicketCategory extends Document, BaseAuditFields {
  name: string;
  status: "Active" | "Deleted";
}

const TicketCategorySchema = new Schema<ITicketCategory>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Deleted"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

TicketCategorySchema.index({ name: 1 }, { unique: true });
TicketCategorySchema.index({ status: 1 });

export const TicketCategory =
  mongoose.models.TicketCategory ||
  mongoose.model<ITicketCategory>("TicketCategory", TicketCategorySchema, "ticket_categories");
