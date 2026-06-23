export interface Asset {
  id: string;
  item_id: string | null;
  item_name?: string;
  barcode: string;
  serial_number: string | null;
  remarks: string | null;
  purchase_date: Date | null;
  purchase_price: number | null;
  warranty_expiry: Date | null;
  location_id: string | null;
  location_name?: string;
  assigned_to_employee: string | null;
  assigned_to_employee_name?: string;
  assigned_to_department: string | null;
  assigned_to_department_name?: string;
  status: "Available" | "Assigned" | "Repair" | "Lost" | "Disposed" | "Deleted";
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

export interface CreateAssetInput {
  item_id?: string;
  barcode?: string;
  serial_number?: string;
  remarks?: string;
  purchase_date?: string;
  purchase_price?: number;
  warranty_expiry?: string;
  location_id?: string;
  assigned_to_employee?: string;
  assigned_to_department?: string;
  status?: "Available" | "Assigned" | "Repair" | "Lost" | "Disposed" | "Deleted";
}

export interface UpdateAssetInput extends Partial<CreateAssetInput> {}

export interface AssetFilters {
  search?: string;
  barcode?: string;
  serial_number?: string;
  item_id?: string;
  location_id?: string;
  assigned_to_employee?: string;
  assigned_to_department?: string;
  status?: string;
}

export interface AssetAdvancedFilter {
  field: keyof Asset;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
