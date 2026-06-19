import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IPermission extends Document, BaseAuditFields {
  name: string;
  description: string | null;
  status_id: Types.ObjectId;
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
  status_id: {
    type: Schema.Types.ObjectId,
    ref: "PermissionStatus",
    required: true,
  },
  ...BaseAuditSchemaDefinition,
});

PermissionSchema.index({ name: 1 }, { unique: true });
PermissionSchema.index({ status_id: 1 });

export const Permission =
  mongoose.models.Permission ||
  mongoose.model<IPermission>("Permission", PermissionSchema, "permissions");
