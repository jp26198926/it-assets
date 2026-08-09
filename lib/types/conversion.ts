export interface Conversion {
  id: string;
  code: string;
  date_converted: Date;
  location_id: string;
  location_name?: string;
  from_item_id: string;
  from_item_name?: string;
  from_item_code?: string;
  to_item_id: string;
  to_item_name?: string;
  to_item_code?: string;
  from_qty: number;
  to_qty: number;
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

export interface CreateConversionInput {
  date_converted: Date;
  location_id: string;
  from_item_id: string;
  to_item_id: string;
  from_qty: number;
  to_qty: number;
  remarks?: string;
}

export interface ConversionFilters {
  search?: string;
  code?: string;
  location_id?: string;
  from_item_id?: string;
  to_item_id?: string;
  date_from?: string;
  date_to?: string;
}
