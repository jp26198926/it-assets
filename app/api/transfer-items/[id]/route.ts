import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as transferItemService from "@/lib/services/transfer-item-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/transfers", "Access");
    if (error) return error;

    const { id } = await params;
    const item = await transferItemService.getTransferItemById(id);
    if (!item) return apiError("Transfer item not found", 404);
    return apiSuccess(item);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch transfer item");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/transfers", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const item = await transferItemService.updateTransferItem(id, {
      item_id: body.item_id,
      qty: body.qty,
      remarks: body.remarks,
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update transfer item");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/transfers", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty
    }

    await transferItemService.deleteTransferItem(id, reason);
    return apiSuccess({ message: "Transfer item deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete transfer item");
  }
}
