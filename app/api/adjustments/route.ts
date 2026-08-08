import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as adjustmentService from "@/lib/services/adjustment-service";
import type { AdjustmentFilters } from "@/lib/types/adjustment";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/adjustments", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: AdjustmentFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("code")) filters.code = searchParams.get("code")!;
    if (searchParams.get("location_id")) filters.location_id = searchParams.get("location_id")!;
    if (searchParams.get("item_id")) filters.item_id = searchParams.get("item_id")!;
    if (searchParams.get("date_from")) filters.date_from = searchParams.get("date_from")!;
    if (searchParams.get("date_to")) filters.date_to = searchParams.get("date_to")!;

    const hasFilters = Object.keys(filters).length > 0;
    const adjustments = await adjustmentService.getAdjustments(hasFilters ? filters : undefined);
    return apiSuccess(adjustments);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch adjustments");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/adjustments", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.date_adjusted) {
      return apiError("date_adjusted is required", 400);
    }
    if (!body.location_id) {
      return apiError("location_id is required", 400);
    }
    if (!body.item_id) {
      return apiError("item_id is required", 400);
    }
    if (body.qty === undefined || body.qty === null) {
      return apiError("qty is required", 400);
    }

    const adjustment = await adjustmentService.createAdjustment({
      date_adjusted: new Date(body.date_adjusted),
      location_id: body.location_id,
      item_id: body.item_id,
      qty: body.qty,
      remarks: body.remarks,
    });
    return apiSuccess(adjustment, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create adjustment");
  }
}
