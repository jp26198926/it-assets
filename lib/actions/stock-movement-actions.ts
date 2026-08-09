"use server";

import * as stockMovementService from "@/lib/services/stock-movement-service";
import type { StockMovement, StockMovementFilters } from "@/lib/types/stock-movement";

export async function getStockMovements(filters?: StockMovementFilters): Promise<StockMovement[]> {
  return stockMovementService.getStockMovements(filters);
}
