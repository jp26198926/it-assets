import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as releasingService from "@/lib/services/releasing-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/releasings", "Edit");
    if (error) return error;

    const { id } = await params;
    await releasingService.completeReleasing(id);
    return apiSuccess({ message: "Releasing completed successfully" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to complete releasing");
  }
}
