export interface Permission {
  id: string;
  name: string;
  description: string | null;
  status: "Active" | "Deleted";
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface CreatePermissionInput {
  name: string;
  description?: string;
}

export interface UpdatePermissionInput extends Partial<CreatePermissionInput> {}

export interface PermissionFilters {
  search?: string;
  name?: string;
  description?: string;
  status?: string;
}

export interface PermissionAdvancedFilter {
  field: keyof Permission;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
