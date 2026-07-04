import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingService from "@/lib/services/meeting-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meetings", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    if (!body.employee_id) {
      return apiError("employee_id is required", 400);
    }

    const meeting = await meetingService.addAttendee(id, {
      employee_id: body.employee_id,
      attendance_status: body.attendance_status || "Pending",
      notes: body.notes || null,
    });

    return apiSuccess(meeting, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to add attendee");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meetings", "Edit");
    if (error) return error;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const attendeeId = searchParams.get("attendeeId");

    if (!attendeeId) {
      return apiError("attendeeId query parameter is required", 400);
    }

    const meeting = await meetingService.removeAttendee(id, attendeeId);
    return apiSuccess(meeting);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to remove attendee");
  }
}
