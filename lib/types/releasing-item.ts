export interface ReleasingItem {
  id: string;
  code: string;
  releasing_id: string;
  item_id: string;
  item_name?: string;
  item_code?: string;
  item_uom_name?: string;
  qty: number;
  from_location_id: string | null;
  from_location_name?: string;
  remarks: string | null;
  status: "Active" | "Completed" | "Cancelled";
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

export interface CreateReleasingItemInput {
  releasing_id: string;
  item_id: string;
  qty: number;
  remarks?: string;
}

export interface UpdateReleasingItemInput {
  item_id?: string;
  qty?: number;
  remarks?: string;
}
