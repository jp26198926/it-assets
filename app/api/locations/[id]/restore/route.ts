import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as locationService from "@/lib/services/location-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await locationService.restoreLocation(id);
    return apiSuccess({ message: "Location restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore location");
  }
}
