import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as releasingItemService from "@/lib/services/releasing-item-service";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/releasings", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const releasingId = searchParams.get("releasing_id");
    if (!releasingId) {
      return apiError("releasing_id is required", 400);
    }

    const items = await releasingItemService.getReleasingItems(releasingId);
    return apiSuccess(items);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch releasing items");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/releasings", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.releasing_id) {
      return apiError("releasing_id is required", 400);
    }
    if (!body.item_id) {
      return apiError("item_id is required", 400);
    }

    const item = await releasingItemService.createReleasingItem({
      releasing_id: body.releasing_id,
      item_id: body.item_id,
      qty: body.qty || 0,
      remarks: body.remarks,
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create releasing item");
  }
}
