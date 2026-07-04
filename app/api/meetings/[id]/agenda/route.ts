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

    if (!body.topic || typeof body.topic !== "string") {
      return apiError("topic is required", 400);
    }

    const meeting = await meetingService.addAgendaItem(id, {
      topic: body.topic,
      description: body.description || null,
      presenter: body.presenter || null,
      duration_minutes: body.duration_minutes || null,
      notes: body.notes || null,
    });

    return apiSuccess(meeting, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to add agenda item");
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

    if (!body.itemId) {
      return apiError("itemId is required", 400);
    }

    const meeting = await meetingService.updateAgendaItem(id, body.itemId, {
      topic: body.topic,
      description: body.description,
      presenter: body.presenter,
      duration_minutes: body.duration_minutes,
      notes: body.notes,
    });

    return apiSuccess(meeting);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update agenda item");
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
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return apiError("itemId query parameter is required", 400);
    }

    const meeting = await meetingService.removeAgendaItem(id, itemId);
    return apiSuccess(meeting);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to remove agenda item");
  }
}
