import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as conversionService from "@/lib/services/conversion-service";
import type { ConversionFilters } from "@/lib/types/conversion";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/conversions", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: ConversionFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("code")) filters.code = searchParams.get("code")!;
    if (searchParams.get("location_id")) filters.location_id = searchParams.get("location_id")!;
    if (searchParams.get("from_item_id")) filters.from_item_id = searchParams.get("from_item_id")!;
    if (searchParams.get("to_item_id")) filters.to_item_id = searchParams.get("to_item_id")!;
    if (searchParams.get("date_from")) filters.date_from = searchParams.get("date_from")!;
    if (searchParams.get("date_to")) filters.date_to = searchParams.get("date_to")!;

    const hasFilters = Object.keys(filters).length > 0;
    const conversions = await conversionService.getConversions(hasFilters ? filters : undefined);
    return apiSuccess(conversions);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch conversions");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/conversions", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.date_converted) {
      return apiError("date_converted is required", 400);
    }
    if (!body.location_id) {
      return apiError("location_id is required", 400);
    }
    if (!body.from_item_id) {
      return apiError("from_item_id is required", 400);
    }
    if (!body.to_item_id) {
      return apiError("to_item_id is required", 400);
    }
    if (body.from_qty === undefined || body.from_qty === null) {
      return apiError("from_qty is required", 400);
    }
    if (body.to_qty === undefined || body.to_qty === null) {
      return apiError("to_qty is required", 400);
    }

    const conversion = await conversionService.createConversion({
      date_converted: new Date(body.date_converted),
      location_id: body.location_id,
      from_item_id: body.from_item_id,
      to_item_id: body.to_item_id,
      from_qty: body.from_qty,
      to_qty: body.to_qty,
      remarks: body.remarks,
    });
    return apiSuccess(conversion, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create conversion");
  }
}
