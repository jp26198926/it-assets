import { Schema, Types } from "mongoose";

export interface BaseAuditFields {
  created_at: Date;
  created_by: Types.ObjectId | null;
  updated_at: Date | null;
  updated_by: Types.ObjectId | null;
  deleted_at: Date | null;
  deleted_by: Types.ObjectId | null;
  deleted_reason: string | null;
}

export const BaseAuditSchemaDefinition = {
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  updated_at: {
    type: Date,
    default: null,
  },
  updated_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
  deleted_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  deleted_reason: {
    type: String,
    default: null,
  },
};
