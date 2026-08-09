import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as transferService from "@/lib/services/transfer-service";
import type { TransferFilters } from "@/lib/types/transfer";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/transfers", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: TransferFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("code")) filters.code = searchParams.get("code")!;
    if (searchParams.get("from_location_id")) filters.from_location_id = searchParams.get("from_location_id")!;
    if (searchParams.get("to_location_id")) filters.to_location_id = searchParams.get("to_location_id")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("date_from")) filters.date_from = searchParams.get("date_from")!;
    if (searchParams.get("date_to")) filters.date_to = searchParams.get("date_to")!;

    const hasFilters = Object.keys(filters).length > 0;
    const transfers = await transferService.getTransfers(hasFilters ? filters : undefined);
    return apiSuccess(transfers);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch transfers");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/transfers", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.date_transferred) {
      return apiError("date_transferred is required", 400);
    }
    if (!body.from_location_id) {
      return apiError("from_location_id is required", 400);
    }
    if (!body.to_location_id) {
      return apiError("to_location_id is required", 400);
    }

    const transfer = await transferService.createTransfer({
      date_transferred: new Date(body.date_transferred),
      from_location_id: body.from_location_id,
      to_location_id: body.to_location_id,
      remarks: body.remarks,
    });
    return apiSuccess(transfer, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create transfer");
  }
}
