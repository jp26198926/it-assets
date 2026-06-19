export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status_id: string;
  status?: string;
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
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

export interface DepartmentStatus {
  id: string;
  status: string;
}
