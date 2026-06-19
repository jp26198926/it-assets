import mongoose, { Schema, Document } from "mongoose";

export interface IPageStatus extends Document {
  status: string;
}

const PageStatusSchema = new Schema<IPageStatus>({
  status: {
    type: String,
    required: true,
  },
});

export const PageStatus =
  mongoose.models.PageStatus ||
  mongoose.model<IPageStatus>("PageStatus", PageStatusSchema, "page_statuses");
