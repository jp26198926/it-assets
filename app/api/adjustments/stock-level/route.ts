import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as adjustmentService from "@/lib/services/adjustment-service";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/adjustments", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");
    const itemId = searchParams.get("item_id");

    if (!locationId || !itemId) {
      return apiError("location_id and item_id are required", 400);
    }

    const stockLevel = await adjustmentService.getStockLevelForItemAndLocation(itemId, locationId);
    return apiSuccess(stockLevel);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch stock level");
  }
}
