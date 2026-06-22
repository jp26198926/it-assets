export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: "Active" | "Deleted";
  created_at: Date;
  created_by: string | null;
  created_by_name?: string;
  updated_at: Date | null;
  updated_by: string | null;
  updated_by_name?: string;
  deleted_at: Date | null;
  deleted_by: string | null;
  deleted_by_name?: string;
  deleted_reason: string | null;
}

export interface CreateDepartmentInput {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {}

export interface DepartmentFilters {
  search?: string;
  code?: string;
  name?: string;
  description?: string;
  status?: string;
}

export interface DepartmentAdvancedFilter {
  field: keyof Department;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
