import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingTypeService from "@/lib/services/meeting-type-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meeting-types", "Access");
    if (error) return error;

    const { id } = await params;
    const meetingType = await meetingTypeService.getMeetingTypeById(id);
    if (!meetingType) return apiError("Meeting type not found", 404);
    return apiSuccess(meetingType);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch meeting type");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meeting-types", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const meetingType = await meetingTypeService.updateMeetingType(id, {
      name: body.name,
      description: body.description,
      color: body.color,
    });

    return apiSuccess(meetingType);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update meeting type");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/meeting-types", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty
    }

    await meetingTypeService.deleteMeetingType(id, reason);
    return apiSuccess({ message: "Meeting type deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete meeting type");
  }
}
