"use server";

import * as rolePermissionService from "@/lib/services/role-permission-service";
import type { CreateRolePermissionInput, RolePermissionEntry } from "@/lib/types/role-permission";

export async function getRolePermissions(roleId: string): Promise<RolePermissionEntry[]> {
  return rolePermissionService.getRolePermissions(roleId);
}

export async function createRolePermission(roleId: string, data: CreateRolePermissionInput): Promise<void> {
  return rolePermissionService.createRolePermission(roleId, data);
}

export async function deleteRolePermission(roleId: string, pageId: string, permissionId: string): Promise<void> {
  return rolePermissionService.deleteRolePermission(roleId, pageId, permissionId);
}
