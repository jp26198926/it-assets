import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as releasingItemService from "@/lib/services/releasing-item-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/releasings", "Access");
    if (error) return error;

    const { id } = await params;
    const item = await releasingItemService.getReleasingItemById(id);
    if (!item) return apiError("Releasing item not found", 404);
    return apiSuccess(item);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch releasing item");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/releasings", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const item = await releasingItemService.updateReleasingItem(id, {
      item_id: body.item_id,
      qty: body.qty,
      remarks: body.remarks,
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update releasing item");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/releasings", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty
    }

    await releasingItemService.deleteReleasingItem(id, reason);
    return apiSuccess({ message: "Releasing item deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete releasing item");
  }
}
