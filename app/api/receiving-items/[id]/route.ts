import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as receivingItemService from "@/lib/services/receiving-item-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/receivings", "Access");
    if (error) return error;

    const { id } = await params;
    const item = await receivingItemService.getReceivingItemById(id);
    if (!item) return apiError("Receiving item not found", 404);
    return apiSuccess(item);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch receiving item");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/receivings", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const item = await receivingItemService.updateReceivingItem(id, {
      item_id: body.item_id,
      qty: body.qty,
      unit_price: body.unit_price,
      expiration_date: body.expiration_date ? new Date(body.expiration_date) : undefined,
      remarks: body.remarks,
      storage_location_id: body.storage_location_id,
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update receiving item");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/receivings", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty
    }

    await receivingItemService.deleteReceivingItem(id, reason);
    return apiSuccess({ message: "Receiving item deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete receiving item");
  }
}
