export interface RolePermissionEntry {
  page_id: string;
  page_name?: string;
  permission_id: string;
  permission_name?: string;
}

export interface CreateRolePermissionInput {
  page_id: string;
  permission_id: string;
}
