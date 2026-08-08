"use server";

import * as stockMovementService from "@/lib/services/stock-movement-service";
import type { StockMovement } from "@/lib/types/stock-movement";

export async function getStockMovements(filters?: {
  item_id?: string;
  location_id?: string;
  transaction_type?: string;
}): Promise<StockMovement[]> {
  return stockMovementService.getStockMovements(filters);
}
