import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as adjustmentService from "@/lib/services/adjustment-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/adjustments", "Access");
    if (error) return error;

    const { id } = await params;
    const adjustment = await adjustmentService.getAdjustmentById(id);
    if (!adjustment) return apiError("Adjustment not found", 404);
    return apiSuccess(adjustment);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch adjustment");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/adjustments", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty
    }

    await adjustmentService.deleteAdjustment(id, reason);
    return apiSuccess({ message: "Adjustment deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete adjustment");
  }
}
