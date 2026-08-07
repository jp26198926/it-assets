export interface ReceivingItem {
  id: string;
  code: string;
  receiving_id: string;
  item_id: string;
  item_name?: string;
  item_code?: string;
  item_uom_name?: string;
  qty: number;
  unit_price: number;
  total_cost: number;
  expiration_date: Date | null;
  remarks: string | null;
  storage_location_id: string | null;
  storage_location_name?: string;
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

export interface CreateReceivingItemInput {
  receiving_id: string;
  item_id: string;
  qty: number;
  unit_price: number;
  expiration_date?: Date;
  remarks?: string;
  storage_location_id?: string;
}

export interface UpdateReceivingItemInput {
  item_id?: string;
  qty?: number;
  unit_price?: number;
  expiration_date?: Date;
  remarks?: string;
  storage_location_id?: string;
}
