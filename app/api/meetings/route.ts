import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingService from "@/lib/services/meeting-service";
import type { MeetingFilters } from "@/lib/types/meeting";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/meetings", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: MeetingFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("title")) filters.title = searchParams.get("title")!;
    if (searchParams.get("meeting_type_id")) filters.meeting_type_id = searchParams.get("meeting_type_id")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("location")) filters.location = searchParams.get("location")!;
    if (searchParams.get("scheduled_date_from")) filters.scheduled_date_from = searchParams.get("scheduled_date_from")!;
    if (searchParams.get("scheduled_date_to")) filters.scheduled_date_to = searchParams.get("scheduled_date_to")!;
    if (searchParams.get("attendee_employee_id")) filters.attendee_employee_id = searchParams.get("attendee_employee_id")!;

    const hasFilters = Object.keys(filters).length > 0;
    const meetings = await meetingService.getMeetings(hasFilters ? filters : undefined);
    return apiSuccess(meetings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch meetings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/meetings", "Add");
    if (error) return error;

    const body = await request.json();

    if (!body.title || typeof body.title !== "string") {
      return apiError("title is required", 400);
    }

    if (!body.scheduled_date) {
      return apiError("scheduled_date is required", 400);
    }

    if (!body.start_time || typeof body.start_time !== "string") {
      return apiError("start_time is required", 400);
    }

    const meeting = await meetingService.createMeeting({
      title: body.title,
      description: body.description,
      meeting_type_id: body.meeting_type_id,
      scheduled_date: new Date(body.scheduled_date),
      start_time: body.start_time,
      end_time: body.end_time,
      location: body.location,
      meeting_link: body.meeting_link,
      platform: body.platform,
      notes: body.notes,
      agenda_items: body.agenda_items,
      attendees: body.attendees,
      attachments: body.attachments,
      is_recurring: body.is_recurring,
      recurrence: body.recurrence,
    });

    return apiSuccess(meeting, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create meeting");
  }
}
