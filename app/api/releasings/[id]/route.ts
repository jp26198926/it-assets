import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as releasingService from "@/lib/services/releasing-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/releasings", "Access");
    if (error) return error;

    const { id } = await params;
    const releasing = await releasingService.getReleasingById(id);
    if (!releasing) return apiError("Releasing not found", 404);
    return apiSuccess(releasing);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch releasing");
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

    const releasing = await releasingService.updateReleasing(id, {
      date_released: body.date_released ? new Date(body.date_released) : undefined,
      from_location_id: body.from_location_id,
      to_department_id: body.to_department_id,
      remarks: body.remarks,
    });
    return apiSuccess(releasing);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update releasing");
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

    await releasingService.deleteReleasing(id, reason);
    return apiSuccess({ message: "Releasing deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete releasing");
  }
}
