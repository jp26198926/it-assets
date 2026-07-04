import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingService from "@/lib/services/meeting-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meetings", "Access");
    if (error) return error;

    const { id } = await params;
    const meeting = await meetingService.getMeetingById(id);
    if (!meeting) return apiError("Meeting not found", 404);
    return apiSuccess(meeting);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch meeting");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meetings", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.meeting_type_id !== undefined) updateData.meeting_type_id = body.meeting_type_id;
    if (body.scheduled_date !== undefined) updateData.scheduled_date = new Date(body.scheduled_date);
    if (body.start_time !== undefined) updateData.start_time = body.start_time;
    if (body.end_time !== undefined) updateData.end_time = body.end_time;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.meeting_link !== undefined) updateData.meeting_link = body.meeting_link;
    if (body.platform !== undefined) updateData.platform = body.platform;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.agenda_items !== undefined) updateData.agenda_items = body.agenda_items;
    if (body.attendees !== undefined) updateData.attendees = body.attendees;
    if (body.attachments !== undefined) updateData.attachments = body.attachments;
    if (body.is_recurring !== undefined) updateData.is_recurring = body.is_recurring;
    if (body.recurrence !== undefined) updateData.recurrence = body.recurrence;

    const meeting = await meetingService.updateMeeting(id, updateData);
    return apiSuccess(meeting);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update meeting");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meetings", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty
    }

    await meetingService.deleteMeeting(id, reason);
    return apiSuccess({ message: "Meeting deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete meeting");
  }
}
