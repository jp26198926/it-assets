import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as locationService from "@/lib/services/location-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const location = await locationService.getLocationById(id);
    if (!location) return apiError("Location not found", 404);
    return apiSuccess(location);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch location");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const location = await locationService.updateLocation(id, {
      name: body.name,
    });

    return apiSuccess(location);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update location");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await locationService.deleteLocation(id, reason);
    return apiSuccess({ message: "Location deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete location");
  }
}
