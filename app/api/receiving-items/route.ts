import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as receivingItemService from "@/lib/services/receiving-item-service";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/receivings", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const receivingId = searchParams.get("receiving_id");
    if (!receivingId) {
      return apiError("receiving_id is required", 400);
    }

    const items = await receivingItemService.getReceivingItems(receivingId);
    return apiSuccess(items);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch receiving items");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/receivings", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.receiving_id) {
      return apiError("receiving_id is required", 400);
    }
    if (!body.item_id) {
      return apiError("item_id is required", 400);
    }

    const item = await receivingItemService.createReceivingItem({
      receiving_id: body.receiving_id,
      item_id: body.item_id,
      qty: body.qty || 0,
      unit_price: body.unit_price || 0,
      expiration_date: body.expiration_date ? new Date(body.expiration_date) : undefined,
      remarks: body.remarks,
      storage_location_id: body.storage_location_id,
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create receiving item");
  }
}
