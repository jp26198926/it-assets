export interface Adjustment {
  id: string;
  code: string;
  date_adjusted: Date;
  location_id: string;
  location_name?: string;
  item_id: string;
  item_name?: string;
  item_code?: string;
  qty: number;
  remarks: string | null;
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

export interface CreateAdjustmentInput {
  date_adjusted: Date;
  location_id: string;
  item_id: string;
  qty: number;
  remarks?: string;
}

export interface AdjustmentFilters {
  search?: string;
  code?: string;
  location_id?: string;
  item_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface AdjustmentAdvancedFilter {
  field: string;
  operator: "contains" | "equals" | "startsWith";
  value: string;
}
