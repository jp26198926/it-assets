export interface StockMovement {
  id: string;
  date: Date;
  transaction_type: "RECEIVE" | "RELEASE" | "ADJUSTMENT" | "TRANSFER" | "CONVERSION";
  item_id: string;
  item_name?: string;
  item_code?: string;
  location_id: string;
  location_name?: string;
  qty: number;
  reference_trans_id: string;
  reference_item_id: string;
  reference_description: string | null;
  remarks: string | null;
}

export interface CreateStockMovementInput {
  date: Date;
  transaction_type: "RECEIVE" | "RELEASE" | "ADJUSTMENT" | "TRANSFER" | "CONVERSION";
  item_id: string;
  location_id: string;
  qty: number;
  reference_trans_id: string;
  reference_item_id: string;
  reference_description?: string;
  remarks?: string;
}

export interface StockMovementFilters {
  date_from?: string;
  date_to?: string;
  transaction_type?: string;
  item_name?: string;
  location_name?: string;
  reference_description?: string;
  remarks?: string;
}
