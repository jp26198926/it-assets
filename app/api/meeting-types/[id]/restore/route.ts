import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingTypeService from "@/lib/services/meeting-type-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meeting-types", "Restore");
    if (error) return error;

    const { id } = await params;
    await meetingTypeService.restoreMeetingType(id);
    return apiSuccess({ message: "Meeting type restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore meeting type");
  }
}
