import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as stockLevelService from "@/lib/services/stock-level-service";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/stock-levels", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: { item_id?: string; location_id?: string } = {};
    if (searchParams.get("item_id")) filters.item_id = searchParams.get("item_id")!;
    if (searchParams.get("location_id")) filters.location_id = searchParams.get("location_id")!;

    const hasFilters = Object.keys(filters).length > 0;
    const levels = await stockLevelService.getStockLevels(hasFilters ? filters : undefined);
    return apiSuccess(levels);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch stock levels");
  }
}
