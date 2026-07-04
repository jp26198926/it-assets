import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingActionItemService from "@/lib/services/meeting-action-item-service";
import type { MeetingActionItemFilters } from "@/lib/types/meeting-action-item";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/meeting-action-items", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: MeetingActionItemFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("meeting_id")) filters.meeting_id = searchParams.get("meeting_id")!;
    if (searchParams.get("assigned_to")) filters.assigned_to = searchParams.get("assigned_to")!;
    if (searchParams.get("priority")) filters.priority = searchParams.get("priority")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("due_date_from")) filters.due_date_from = searchParams.get("due_date_from")!;
    if (searchParams.get("due_date_to")) filters.due_date_to = searchParams.get("due_date_to")!;

    const hasFilters = Object.keys(filters).length > 0;
    const items = await meetingActionItemService.getMeetingActionItems(
      hasFilters ? filters : undefined
    );
    return apiSuccess(items);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch action items"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/meeting-action-items", "Add");
    if (error) return error;

    const body = await request.json();

    if (!body.meeting_id) {
      return apiError("meeting_id is required", 400);
    }

    if (!body.title || typeof body.title !== "string") {
      return apiError("title is required", 400);
    }

    const item = await meetingActionItemService.createMeetingActionItem({
      meeting_id: body.meeting_id,
      title: body.title,
      description: body.description,
      assigned_to: body.assigned_to,
      due_date: body.due_date ? new Date(body.due_date) : undefined,
      priority: body.priority,
    });

    return apiSuccess(item, 201);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to create action item"
    );
  }
}
