import * as roleService from "@/lib/services/role-service";
import type { CreateRolePermissionInput, RolePermissionEntry } from "@/lib/types/role-permission";

export async function getRolePermissions(roleId: string): Promise<RolePermissionEntry[]> {
  return roleService.getRolePermissions(roleId);
}

export async function createRolePermission(roleId: string, data: CreateRolePermissionInput): Promise<void> {
  return roleService.addRolePermission(roleId, data.page_id, data.permission_id);
}

export async function deleteRolePermission(roleId: string, pageId: string, permissionId: string): Promise<void> {
  return roleService.removeRolePermission(roleId, pageId, permissionId);
}
