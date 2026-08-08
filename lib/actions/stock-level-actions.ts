"use server";

import * as stockLevelService from "@/lib/services/stock-level-service";
import type { StockLevel } from "@/lib/types/stock-level";

export async function getStockLevels(filters?: { item_id?: string; location_id?: string }): Promise<StockLevel[]> {
  return stockLevelService.getStockLevels(filters);
}
