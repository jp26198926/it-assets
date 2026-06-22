export interface Category {
  id: string;
  name: string;
  type: "Inventoriable" | "Consumable";
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

export interface CreateCategoryInput {
  name: string;
  type: "Inventoriable" | "Consumable";
  description?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export interface CategoryFilters {
  search?: string;
  name?: string;
  type?: string;
  description?: string;
  status?: string;
}

export interface CategoryAdvancedFilter {
  field: keyof Category;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
