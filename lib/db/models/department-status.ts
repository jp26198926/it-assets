import mongoose, { Schema, Document } from "mongoose";

export interface IDepartmentStatus extends Document {
  status: string;
}

const DepartmentStatusSchema = new Schema<IDepartmentStatus>({
  status: {
    type: String,
    required: true,
  },
});

export const DepartmentStatus =
  mongoose.models.DepartmentStatus ||
  mongoose.model<IDepartmentStatus>("DepartmentStatus", DepartmentStatusSchema, "department_statuses");
