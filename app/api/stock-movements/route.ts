import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as stockMovementService from "@/lib/services/stock-movement-service";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/stock-movements", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: { item_id?: string; location_id?: string; transaction_type?: string } = {};
    if (searchParams.get("item_id")) filters.item_id = searchParams.get("item_id")!;
    if (searchParams.get("location_id")) filters.location_id = searchParams.get("location_id")!;
    if (searchParams.get("transaction_type")) filters.transaction_type = searchParams.get("transaction_type")!;

    const hasFilters = Object.keys(filters).length > 0;
    const movements = await stockMovementService.getStockMovements(hasFilters ? filters : undefined);
    return apiSuccess(movements);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch stock movements");
  }
}
