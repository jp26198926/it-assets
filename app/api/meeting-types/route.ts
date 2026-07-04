import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as meetingTypeService from "@/lib/services/meeting-type-service";
import type { MeetingTypeFilters } from "@/lib/types/meeting-type";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/meeting-types", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: MeetingTypeFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("description")) filters.description = searchParams.get("description")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const meetingTypes = await meetingTypeService.getMeetingTypes(hasFilters ? filters : undefined);
    return apiSuccess(meetingTypes);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch meeting types");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/meeting-types", "Add");
    if (error) return error;

    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const meetingType = await meetingTypeService.createMeetingType({
      name: body.name,
      description: body.description,
      color: body.color,
    });

    return apiSuccess(meetingType, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create meeting type");
  }
}
