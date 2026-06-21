import { connectDB } from "@/lib/db/connection";
import { Permission as PermissionModel } from "@/lib/db/models/permission";
import type { CreatePermissionInput, UpdatePermissionInput, PermissionFilters, Permission } from "@/lib/types/permission";

function toPermission(p: Record<string, unknown>): Permission {
  return {
    id: (p._id as { toString(): string }).toString(),
    name: p.name as string,
    description: (p.description as string) ?? null,
    status: p.status as "Active" | "Deleted",
    created_at: p.created_at as Date,
    created_by: p.created_by ? (p.created_by as { toString(): string }).toString() : null,
    updated_at: (p.updated_at as Date) ?? null,
    updated_by: p.updated_by ? (p.updated_by as { toString(): string }).toString() : null,
    deleted_at: (p.deleted_at as Date) ?? null,
  };
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
    query.status = filters.status;
  }

  const permissions = await PermissionModel.find(query)
    .sort({ created_at: -1 })
    .lean();

  return permissions.map((p) => toPermission(p as unknown as Record<string, unknown>));
}

export async function getPermissionById(id: string): Promise<Permission | null> {
  await connectDB();

  const permission = await PermissionModel.findById(id).lean();

  if (!permission) return null;

  return toPermission(permission as unknown as Record<string, unknown>);
}

export async function createPermission(data: CreatePermissionInput): Promise<Permission> {
  await connectDB();

  const permission = await PermissionModel.create({
    name: data.name,
    description: data.description || null,
    status: "Active",
  });

  const created = await PermissionModel.findById(permission._id).lean();

  if (!created) throw new Error("Failed to create permission");

  return toPermission(created as unknown as Record<string, unknown>);
}

export async function updatePermission(id: string, data: UpdatePermissionInput): Promise<Permission> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  updateData.updated_at = new Date();

  const permission = await PermissionModel.findByIdAndUpdate(id, updateData, { new: true })
    .lean();

  if (!permission) throw new Error("Permission not found");

  return toPermission(permission as unknown as Record<string, unknown>);
}

export async function deletePermission(id: string, reason?: string): Promise<void> {
  await connectDB();

  await PermissionModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restorePermission(id: string): Promise<void> {
  await connectDB();

  await PermissionModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
