"use server";

import { connectDB } from "@/lib/db/connection";
import { Permission as PermissionModel } from "@/lib/db/models/permission";
import { PermissionStatus as PermissionStatusModel } from "@/lib/db/models/permission-status";
import type { CreatePermissionInput, UpdatePermissionInput, PermissionFilters, Permission, PermissionStatus as PermissionStatusType } from "@/lib/types/permission";

export async function getPermissionStatuses(): Promise<PermissionStatusType[]> {
  await connectDB();
  const statuses = await PermissionStatusModel.find().lean();
  return statuses.map((s) => ({
    id: s._id.toString(),
    status: s.status,
  }));
}

export async function getPermissions(filters?: PermissionFilters): Promise<Permission[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.description) {
    query.description = { $regex: filters.description, $options: "i" };
  }

  if (filters?.status) {
    const statusDoc = await PermissionStatusModel.findOne({ status: filters.status }).lean();
    if (statusDoc) {
      query.status_id = statusDoc._id;
    }
  }

  const permissions = await PermissionModel.find(query)
    .populate("status_id", "status")
    .sort({ created_at: -1 })
    .lean();

  return permissions.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    status_id: (p.status_id as unknown as { _id: { toString(): string } })._id.toString(),
    status: (p.status_id as unknown as { status: string }).status,
    created_at: p.created_at,
    created_by: p.created_by ? (p.created_by as unknown as { toString(): string }).toString() : null,
    updated_at: p.updated_at,
    updated_by: p.updated_by ? (p.updated_by as unknown as { toString(): string }).toString() : null,
    deleted_at: p.deleted_at,
  }));
}

export async function getPermissionById(id: string): Promise<Permission | null> {
  await connectDB();

  const permission = await PermissionModel.findById(id)
    .populate("status_id", "status")
    .lean();

  if (!permission) return null;

  return {
    id: permission._id.toString(),
    name: permission.name,
    description: permission.description,
    status_id: (permission.status_id as unknown as { _id: { toString(): string } })._id.toString(),
    status: (permission.status_id as unknown as { status: string }).status,
    created_at: permission.created_at,
    created_by: permission.created_by ? (permission.created_by as unknown as { toString(): string }).toString() : null,
    updated_at: permission.updated_at,
    updated_by: permission.updated_by ? (permission.updated_by as unknown as { toString(): string }).toString() : null,
    deleted_at: permission.deleted_at,
  };
}

export async function createPermission(data: CreatePermissionInput): Promise<Permission> {
  await connectDB();

  const activeStatus = await PermissionStatusModel.findOne({ status: "Active" }).lean();
  if (!activeStatus) throw new Error("Active status not found");

  const permission = await PermissionModel.create({
    name: data.name,
    description: data.description || null,
    status_id: activeStatus._id,
  });

  const populated = await PermissionModel.findById(permission._id)
    .populate("status_id", "status")
    .lean();

  if (!populated) throw new Error("Failed to create permission");

  return {
    id: populated._id.toString(),
    name: populated.name,
    description: populated.description,
    status_id: (populated.status_id as unknown as { _id: { toString(): string } })._id.toString(),
    status: (populated.status_id as unknown as { status: string }).status,
    created_at: populated.created_at,
    created_by: populated.created_by ? (populated.created_by as unknown as { toString(): string }).toString() : null,
    updated_at: populated.updated_at,
    updated_by: populated.updated_by ? (populated.updated_by as unknown as { toString(): string }).toString() : null,
    deleted_at: populated.deleted_at,
  };
}

export async function updatePermission(id: string, data: UpdatePermissionInput): Promise<Permission> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  updateData.updated_at = new Date();

  const permission = await PermissionModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("status_id", "status")
    .lean();

  if (!permission) throw new Error("Permission not found");

  return {
    id: permission._id.toString(),
    name: permission.name,
    description: permission.description,
    status_id: (permission.status_id as unknown as { _id: { toString(): string } })._id.toString(),
    status: (permission.status_id as unknown as { status: string }).status,
    created_at: permission.created_at,
    created_by: permission.created_by ? (permission.created_by as unknown as { toString(): string }).toString() : null,
    updated_at: permission.updated_at,
    updated_by: permission.updated_by ? (permission.updated_by as unknown as { toString(): string }).toString() : null,
    deleted_at: permission.deleted_at,
  };
}

export async function deletePermission(id: string, reason?: string): Promise<void> {
  await connectDB();

  const deletedStatus = await PermissionStatusModel.findOne({ status: "Deleted" }).lean();
  await PermissionModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status_id: deletedStatus?._id,
    updated_at: new Date(),
  });
}

export async function restorePermission(id: string): Promise<void> {
  await connectDB();

  const activeStatus = await PermissionStatusModel.findOne({ status: "Active" }).lean();
  await PermissionModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status_id: activeStatus?._id,
    updated_at: new Date(),
  });
}
