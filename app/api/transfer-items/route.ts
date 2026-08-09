import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as transferItemService from "@/lib/services/transfer-item-service";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/transfers", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const transferId = searchParams.get("transfer_id");
    if (!transferId) {
      return apiError("transfer_id is required", 400);
    }

    const items = await transferItemService.getTransferItems(transferId);
    return apiSuccess(items);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch transfer items");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/transfers", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.transfer_id) {
      return apiError("transfer_id is required", 400);
    }
    if (!body.item_id) {
      return apiError("item_id is required", 400);
    }

    const item = await transferItemService.createTransferItem({
      transfer_id: body.transfer_id,
      item_id: body.item_id,
      qty: body.qty || 0,
      remarks: body.remarks,
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create transfer item");
  }
}
