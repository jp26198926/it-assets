export interface Page {
  id: string;
  name: string;
  description: string | null;
  path: string;
  icon: string;
  parent_id: string | null;
  parent_name?: string;
  section: string | null;
  order: number;
  status: "Active" | "Deleted";
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface CreatePageInput {
  name: string;
  description?: string;
  path: string;
  icon: string;
  parent_id?: string;
  section?: string;
  order?: number;
}

export interface UpdatePageInput extends Partial<CreatePageInput> {}

export interface PageFilters {
  search?: string;
  name?: string;
  path?: string;
  description?: string;
  status?: string;
  section?: string;
  parent_id?: string;
}

export interface PageAdvancedFilter {
  field: keyof Page;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
