export interface Assignment {
  id: string;
  asset_id: string;
  asset_barcode?: string;
  employee_id: string | null;
  employee_name?: string;
  department_id: string | null;
  department_name?: string;
  location_id: string | null;
  location_name?: string;
  item_name?: string;
  serial_number?: string;
  item_category_name?: string;
  assigned_date: Date;
  returned_date: Date | null;
  condition_on_issue: string;
  condition_on_return: string | null;
  remarks: string | null;
  status: "Active" | "Returned" | "Lost";
  date_lost: Date | null;
  lost_reason: string | null;
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

export interface CreateAssignmentInput {
  asset_id: string;
  employee_id?: string;
  department_id?: string;
  location_id?: string;
  assigned_date: string;
  returned_date?: string;
  condition_on_issue: string;
  condition_on_return?: string;
  remarks?: string;
  status?: "Active" | "Returned" | "Lost";
  created_by?: string | null;
}

export interface UpdateAssignmentInput extends Partial<CreateAssignmentInput> {
  updated_by?: string | null;
}

export interface ReturnAssignmentInput {
  returned_date: string;
  condition_on_return: string;
  location_id?: string;
}

export interface MarkAsLostInput {
  date_lost: string;
  lost_reason: string;
}

export interface AssignmentFilters {
  search?: string;
  asset_id?: string;
  employee_id?: string;
  department_id?: string;
  status?: string;
}

export interface AssignmentAdvancedFilter {
  field: keyof Assignment;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
