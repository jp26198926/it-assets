import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingService from "@/lib/services/meeting-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meetings", "Restore");
    if (error) return error;

    const { id } = await params;
    await meetingService.restoreMeeting(id);
    return apiSuccess({ message: "Meeting restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore meeting");
  }
}
