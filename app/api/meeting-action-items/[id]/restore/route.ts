import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingActionItemService from "@/lib/services/meeting-action-item-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meeting-action-items", "Restore");
    if (error) return error;

    const { id } = await params;
    await meetingActionItemService.restoreMeetingActionItem(id);
    return apiSuccess({ message: "Action item restored" });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to restore action item"
    );
  }
}
