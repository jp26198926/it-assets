import { connectDB } from "@/lib/db/connection";
import { Role as RoleModel } from "@/lib/db/models/role";
import { RoleStatus as RoleStatusModel } from "@/lib/db/models/role-status";
import { Page as PageModel } from "@/lib/db/models/page";
import { Permission as PermissionModel } from "@/lib/db/models/permission";
import type { CreateRoleInput, UpdateRoleInput, RoleFilters, Role, RolePermissionEntry, RoleStatus as RoleStatusType } from "@/lib/types/role";

function toRole(r: Record<string, unknown>): Role {
  const statusId = r.status_id as unknown as { _id: { toString(): string }; status: string };
  const rawPerms = r.permissions as Record<string, unknown>[] | undefined;
  const permissions: RolePermissionEntry[] = (rawPerms || []).map((p) => {
    const page = p.page_id as unknown as { _id: { toString(): string }; name: string } | string;
    const perm = p.permission_id as unknown as { _id: { toString(): string }; name: string } | string;
    return {
      page_id: typeof page === "string" ? page : page._id.toString(),
      page_name: typeof page === "string" ? undefined : page.name,
      permission_id: typeof perm === "string" ? perm : perm._id.toString(),
      permission_name: typeof perm === "string" ? undefined : perm.name,
    };
  });
  return {
    id: (r._id as { toString(): string }).toString(),
    name: r.name as string,
    description: (r.description as string) ?? null,
    status_id: statusId._id.toString(),
    status: statusId.status,
    permissions,
    created_at: r.created_at as Date,
    created_by: r.created_by ? (r.created_by as { toString(): string }).toString() : null,
    updated_at: (r.updated_at as Date) ?? null,
    updated_by: r.updated_by ? (r.updated_by as { toString(): string }).toString() : null,
    deleted_at: (r.deleted_at as Date) ?? null,
  };
}

export async function getRoleStatuses(): Promise<RoleStatusType[]> {
  await connectDB();
  const statuses = await RoleStatusModel.find().lean();
  return statuses.map((s) => ({
    id: s._id.toString(),
    status: s.status,
  }));
}

export async function getRoles(filters?: RoleFilters): Promise<Role[]> {
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
    const statusDoc = await RoleStatusModel.findOne({ status: filters.status }).lean();
    if (statusDoc) {
      query.status_id = statusDoc._id;
    }
  }

  const roles = await RoleModel.find(query)
    .populate("status_id", "status")
    .sort({ created_at: -1 })
    .lean();

  return roles.map((r) => toRole(r as unknown as Record<string, unknown>));
}

export async function getRoleById(id: string): Promise<Role | null> {
  await connectDB();

  const role = await RoleModel.findById(id)
    .populate("status_id", "status")
    .lean();

  if (!role) return null;

  const result = toRole(role as unknown as Record<string, unknown>);
  result.permissions = await populatePermissions(result.permissions);
  return result;
}

async function populatePermissions(perms: RolePermissionEntry[]): Promise<RolePermissionEntry[]> {
  if (perms.length === 0) return perms;

  const pageIds = [...new Set(perms.map((p) => p.page_id))];
  const permIds = [...new Set(perms.map((p) => p.permission_id))];

  const [pages, permissions] = await Promise.all([
    PageModel.find({ _id: { $in: pageIds } }).select("name").lean(),
    PermissionModel.find({ _id: { $in: permIds } }).select("name").lean(),
  ]);

  const pageMap = new Map(pages.map((p) => [(p._id as { toString(): string }).toString(), p.name]));
  const permMap = new Map(permissions.map((p) => [(p._id as { toString(): string }).toString(), p.name]));

  return perms.map((p) => ({
    ...p,
    page_name: pageMap.get(p.page_id),
    permission_name: permMap.get(p.permission_id),
  }));
}

export async function getRolePermissions(roleId: string): Promise<RolePermissionEntry[]> {
  await connectDB();

  const role = await RoleModel.findById(roleId).lean();
  if (!role) throw new Error("Role not found");

  const r = role as unknown as Record<string, unknown>;
  const rawPerms = (r.permissions as Record<string, unknown>[]) || [];
  const perms: RolePermissionEntry[] = rawPerms.map((p) => {
    const pageId = p.page_id as unknown as { toString(): string };
    const permId = p.permission_id as unknown as { toString(): string };
    return {
      page_id: pageId.toString(),
      permission_id: permId.toString(),
    };
  });

  return populatePermissions(perms);
}

export async function addRolePermission(roleId: string, pageId: string, permissionId: string): Promise<void> {
  await connectDB();

  const role = await RoleModel.findById(roleId).lean();
  if (!role) throw new Error("Role not found");

  const r = role as unknown as { permissions: { page_id: { toString(): string }; permission_id: { toString(): string } }[] };
  const exists = r.permissions?.some(
    (p) => p.page_id.toString() === pageId && p.permission_id.toString() === permissionId
  );

  if (exists) return;

  await RoleModel.findByIdAndUpdate(roleId, {
    $push: {
      permissions: { page_id: pageId, permission_id: permissionId },
    },
    updated_at: new Date(),
  });
}

export async function removeRolePermission(roleId: string, pageId: string, permissionId: string): Promise<void> {
  await connectDB();

  await RoleModel.findByIdAndUpdate(roleId, {
    $pull: {
      permissions: { page_id: pageId, permission_id: permissionId },
    },
    updated_at: new Date(),
  });
}

export async function createRole(data: CreateRoleInput): Promise<Role> {
  await connectDB();

  const activeStatus = await RoleStatusModel.findOne({ status: "Active" }).lean();
  if (!activeStatus) throw new Error("Active status not found");

  const role = await RoleModel.create({
    name: data.name,
    description: data.description || null,
    status_id: activeStatus._id,
  });

  const populated = await RoleModel.findById(role._id)
    .populate("status_id", "status")
    .lean();

  if (!populated) throw new Error("Failed to create role");

  return toRole(populated as unknown as Record<string, unknown>);
}

export async function updateRole(id: string, data: UpdateRoleInput): Promise<Role> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  updateData.updated_at = new Date();

  const role = await RoleModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("status_id", "status")
    .lean();

  if (!role) throw new Error("Role not found");

  return toRole(role as unknown as Record<string, unknown>);
}

export async function deleteRole(id: string, reason?: string): Promise<void> {
  await connectDB();

  const deletedStatus = await RoleStatusModel.findOne({ status: "Deleted" }).lean();
  await RoleModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status_id: deletedStatus?._id,
    updated_at: new Date(),
  });
}

export async function restoreRole(id: string): Promise<void> {
  await connectDB();

  const activeStatus = await RoleStatusModel.findOne({ status: "Active" }).lean();
  await RoleModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status_id: activeStatus?._id,
    updated_at: new Date(),
  });
}
