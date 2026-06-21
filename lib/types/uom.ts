export interface UOM {
  id: string;
  code: string;
  name: string;
  status: "Active" | "Deleted";
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface CreateUOMInput {
  code: string;
  name: string;
}

export interface UpdateUOMInput extends Partial<CreateUOMInput> {}

export interface UOMFilters {
  search?: string;
  code?: string;
  name?: string;
  status?: string;
}

export interface UOMAdvancedFilter {
  field: keyof UOM;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
