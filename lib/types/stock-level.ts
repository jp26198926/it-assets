export interface StockLevel {
  id: string;
  item_id: string;
  item_name?: string;
  item_code?: string;
  location_id: string;
  location_name?: string;
  qty: number;
}

export interface CreateStockLevelInput {
  item_id: string;
  location_id: string;
  qty?: number;
}

export interface UpdateStockLevelInput {
  qty?: number;
}

export interface StockLevelFilters {
  item_name?: string;
  item_code?: string;
  location_name?: string;
  qty_min?: number;
  qty_max?: number;
}
