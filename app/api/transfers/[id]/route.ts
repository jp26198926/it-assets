import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as transferService from "@/lib/services/transfer-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/transfers", "Access");
    if (error) return error;

    const { id } = await params;
    const transfer = await transferService.getTransferById(id);
    if (!transfer) return apiError("Transfer not found", 404);
    return apiSuccess(transfer);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch transfer");
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

    const transfer = await transferService.updateTransfer(id, {
      date_transferred: body.date_transferred ? new Date(body.date_transferred) : undefined,
      from_location_id: body.from_location_id,
      to_location_id: body.to_location_id,
      remarks: body.remarks,
    });
    return apiSuccess(transfer);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update transfer");
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

    await transferService.deleteTransfer(id, reason);
    return apiSuccess({ message: "Transfer deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete transfer");
  }
}
