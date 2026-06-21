import * as roleService from "@/lib/services/role-service";
import { invalidateCache } from "@/lib/services/authorization-service";
import type { CreateRolePermissionInput, RolePermissionEntry } from "@/lib/types/role-permission";

export async function getRolePermissions(roleId: string): Promise<RolePermissionEntry[]> {
  return roleService.getRolePermissions(roleId);
}

export async function createRolePermission(roleId: string, data: CreateRolePermissionInput): Promise<void> {
  await roleService.addRolePermission(roleId, data.page_id, data.permission_id);
  invalidateCache(roleId);
}

export async function deleteRolePermission(roleId: string, pageId: string, permissionId: string): Promise<void> {
  await roleService.removeRolePermission(roleId, pageId, permissionId);
  invalidateCache(roleId);
}
