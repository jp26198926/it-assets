import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IPermission extends Document, BaseAuditFields {
  name: string;
  description: string | null;
  status: "Active" | "Deleted";
}

const PermissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Deleted"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

PermissionSchema.index({ name: 1 }, { unique: true });
PermissionSchema.index({ status: 1 });

export const Permission =
  mongoose.models.Permission ||
  mongoose.model<IPermission>("Permission", PermissionSchema, "permissions");
