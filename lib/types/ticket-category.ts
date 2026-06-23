export interface TicketCategory {
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

export interface CreateTicketCategoryInput {
  name: string;
}

export interface UpdateTicketCategoryInput extends Partial<CreateTicketCategoryInput> {}

export interface TicketCategoryFilters {
  search?: string;
  name?: string;
  status?: string;
}

export interface TicketCategoryAdvancedFilter {
  field: keyof TicketCategory;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
