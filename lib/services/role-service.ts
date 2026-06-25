import { connectDB } from "@/lib/db/connection";
import { Role as RoleModel } from "@/lib/db/models/role";
import { Page as PageModel } from "@/lib/db/models/page";
import { Permission as PermissionModel } from "@/lib/db/models/permission";
import type { CreateRoleInput, UpdateRoleInput, RoleFilters, Role, RolePermissionEntry } from "@/lib/types/role";

function toRole(r: Record<string, unknown>): Role {
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

  const createdByVal = r.created_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let created_by: string | null = null;
  let created_by_name: string | undefined;
  if (createdByVal && typeof createdByVal === "object" && "_id" in createdByVal) {
    created_by = createdByVal._id.toString();
    created_by_name = `${createdByVal.first_name} ${createdByVal.last_name}`.trim();
  } else if (typeof createdByVal === "string") {
    created_by = createdByVal;
  }

  const updatedByVal = r.updated_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let updated_by: string | null = null;
  let updated_by_name: string | undefined;
  if (updatedByVal && typeof updatedByVal === "object" && "_id" in updatedByVal) {
    updated_by = updatedByVal._id.toString();
    updated_by_name = `${updatedByVal.first_name} ${updatedByVal.last_name}`.trim();
  } else if (typeof updatedByVal === "string") {
    updated_by = updatedByVal;
  }

  const deletedByVal = r.deleted_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let deleted_by: string | null = null;
  let deleted_by_name: string | undefined;
  if (deletedByVal && typeof deletedByVal === "object" && "_id" in deletedByVal) {
    deleted_by = deletedByVal._id.toString();
    deleted_by_name = `${deletedByVal.first_name} ${deletedByVal.last_name}`.trim();
  } else if (typeof deletedByVal === "string") {
    deleted_by = deletedByVal;
  }

  return {
    id: (r._id as { toString(): string }).toString(),
    name: r.name as string,
    description: (r.description as string) ?? null,
    status: r.status as "Active" | "Deleted",
    permissions,
    created_at: r.created_at as Date,
    created_by,
    created_by_name,
    updated_at: (r.updated_at as Date) ?? null,
    updated_by,
    updated_by_name,
    deleted_at: (r.deleted_at as Date) ?? null,
    deleted_by,
    deleted_by_name,
    deleted_reason: (r.deleted_reason as string) ?? null,
  };
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
    query.status = filters.status;
  }

  const roles = await RoleModel.find(query)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .sort({ created_at: -1 })
    .lean();

  return roles.map((r) => toRole(r as unknown as Record<string, unknown>));
}

export async function getRoleById(id: string): Promise<Role | null> {
  await connectDB();

  const role = await RoleModel.findById(id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
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

  const role = await RoleModel.create({
    name: data.name,
    description: data.description || null,
    status: "Active",
  });

  const created = await RoleModel.findById(role._id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!created) throw new Error("Failed to create role");

  return toRole(created as unknown as Record<string, unknown>);
}

export async function updateRole(id: string, data: UpdateRoleInput): Promise<Role> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  updateData.updated_at = new Date();

  const role = await RoleModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!role) throw new Error("Role not found");

  return toRole(role as unknown as Record<string, unknown>);
}

export async function deleteRole(id: string, reason?: string): Promise<void> {
  await connectDB();

  await RoleModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreRole(id: string): Promise<void> {
  await connectDB();

  await RoleModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}

export async function duplicateRole(
  sourceRoleId: string,
  data: CreateRoleInput
): Promise<Role> {
  await connectDB();

  const sourceRole = await RoleModel.findById(sourceRoleId).lean();
  if (!sourceRole) throw new Error("Source role not found");

  const newRole = await RoleModel.create({
    name: data.name,
    description: data.description || null,
    status: "Active",
  });

  const sourcePerms = await getRolePermissions(sourceRoleId);
  if (sourcePerms.length > 0) {
    await RoleModel.findByIdAndUpdate(newRole._id, {
      $push: {
        permissions: {
          $each: sourcePerms.map((p) => ({
            page_id: p.page_id,
            permission_id: p.permission_id,
          })),
        },
      },
    });
  }

  const created = await RoleModel.findById(newRole._id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!created) throw new Error("Failed to duplicate role");

  return toRole(created as unknown as Record<string, unknown>);
}
