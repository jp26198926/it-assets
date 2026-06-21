export interface RolePermissionEntry {
  page_id: string;
  page_name?: string;
  permission_id: string;
  permission_name?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  status: "Active" | "Deleted";
  permissions: RolePermissionEntry[];
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
}

export interface UpdateRoleInput extends Partial<CreateRoleInput> {}

export interface RoleFilters {
  search?: string;
  name?: string;
  description?: string;
  status?: string;
}

export interface RoleAdvancedFilter {
  field: keyof Role;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
