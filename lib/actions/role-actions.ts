"use server";

import * as roleService from "@/lib/services/role-service";
import type { CreateRoleInput, UpdateRoleInput, RoleFilters, Role } from "@/lib/types/role";

export async function getRoles(filters?: RoleFilters): Promise<Role[]> {
  return roleService.getRoles(filters);
}

export async function getRoleById(id: string): Promise<Role | null> {
  return roleService.getRoleById(id);
}

export async function createRole(data: CreateRoleInput): Promise<Role> {
  return roleService.createRole(data);
}

export async function updateRole(id: string, data: UpdateRoleInput): Promise<Role> {
  return roleService.updateRole(id, data);
}

export async function deleteRole(id: string, reason?: string): Promise<void> {
  return roleService.deleteRole(id, reason);
}

export async function restoreRole(id: string): Promise<void> {
  return roleService.restoreRole(id);
}
