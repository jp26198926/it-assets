"use server";

import * as permissionService from "@/lib/services/permission-service";
import type { CreatePermissionInput, UpdatePermissionInput, PermissionFilters, Permission, PermissionStatus as PermissionStatusType } from "@/lib/types/permission";

export async function getPermissionStatuses(): Promise<PermissionStatusType[]> {
  return permissionService.getPermissionStatuses();
}

export async function getPermissions(filters?: PermissionFilters): Promise<Permission[]> {
  return permissionService.getPermissions(filters);
}

export async function getPermissionById(id: string): Promise<Permission | null> {
  return permissionService.getPermissionById(id);
}

export async function createPermission(data: CreatePermissionInput): Promise<Permission> {
  return permissionService.createPermission(data);
}

export async function updatePermission(id: string, data: UpdatePermissionInput): Promise<Permission> {
  return permissionService.updatePermission(id, data);
}

export async function deletePermission(id: string, reason?: string): Promise<void> {
  return permissionService.deletePermission(id, reason);
}

export async function restorePermission(id: string): Promise<void> {
  return permissionService.restorePermission(id);
}
