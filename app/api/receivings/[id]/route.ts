import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as receivingService from "@/lib/services/receiving-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/receivings", "Access");
    if (error) return error;

    const { id } = await params;
    const receiving = await receivingService.getReceivingById(id);
    if (!receiving) return apiError("Receiving not found", 404);
    return apiSuccess(receiving);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch receiving");
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

    const receiving = await receivingService.updateReceiving(id, {
      date_received: body.date_received ? new Date(body.date_received) : undefined,
      supplier_id: body.supplier_id,
      po_number: body.po_number,
      invoice_number: body.invoice_number,
      remarks: body.remarks,
    });
    return apiSuccess(receiving);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update receiving");
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

    await receivingService.deleteReceiving(id, reason);
    return apiSuccess({ message: "Receiving deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete receiving");
  }
}
