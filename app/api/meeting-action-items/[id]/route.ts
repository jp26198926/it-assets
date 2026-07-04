import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingActionItemService from "@/lib/services/meeting-action-item-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meeting-action-items", "Access");
    if (error) return error;

    const { id } = await params;
    const item = await meetingActionItemService.getMeetingActionItemById(id);
    if (!item) return apiError("Action item not found", 404);
    return apiSuccess(item);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch action item"
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meeting-action-items", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.meeting_id !== undefined) updateData.meeting_id = body.meeting_id;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;
    if (body.due_date !== undefined)
      updateData.due_date = body.due_date ? new Date(body.due_date) : null;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.status !== undefined) updateData.status = body.status;

    const item = await meetingActionItemService.updateMeetingActionItem(id, updateData);
    return apiSuccess(item);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to update action item"
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meeting-action-items", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty
    }

    await meetingActionItemService.deleteMeetingActionItem(id, reason);
    return apiSuccess({ message: "Action item deleted" });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to delete action item"
    );
  }
}
