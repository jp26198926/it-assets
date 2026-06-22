export interface Location {
  id: string;
  name: string;
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

export interface CreateLocationInput {
  name: string;
}

export interface UpdateLocationInput extends Partial<CreateLocationInput> {}

export interface LocationFilters {
  search?: string;
  name?: string;
  status?: string;
}

export interface LocationAdvancedFilter {
  field: keyof Location;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
