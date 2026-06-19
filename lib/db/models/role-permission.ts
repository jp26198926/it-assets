import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IRolePermission extends Document, BaseAuditFields {
  role_id: Types.ObjectId;
  page_id: Types.ObjectId;
  permission_id: Types.ObjectId;
  status_id: Types.ObjectId;
}

const RolePermissionSchema = new Schema<IRolePermission>({
  role_id: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  page_id: {
    type: Schema.Types.ObjectId,
    ref: "Page",
    required: true,
  },
  permission_id: {
    type: Schema.Types.ObjectId,
    ref: "Permission",
    required: true,
  },
  status_id: {
    type: Schema.Types.ObjectId,
    ref: "RolePermissionStatus",
    required: true,
  },
  ...BaseAuditSchemaDefinition,
});

RolePermissionSchema.index(
  { role_id: 1, page_id: 1, permission_id: 1 },
  { unique: true }
);
RolePermissionSchema.index({ role_id: 1, page_id: 1 });
RolePermissionSchema.index({ status_id: 1 });

export const RolePermission =
  mongoose.models.RolePermission ||
  mongoose.model<IRolePermission>("RolePermission", RolePermissionSchema, "role_permissions");
