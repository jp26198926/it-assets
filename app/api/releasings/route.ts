import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as releasingService from "@/lib/services/releasing-service";
import type { ReleasingFilters } from "@/lib/types/releasing";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/releasings", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: ReleasingFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("code")) filters.code = searchParams.get("code")!;
    if (searchParams.get("from_location_id")) filters.from_location_id = searchParams.get("from_location_id")!;
    if (searchParams.get("to_department_id")) filters.to_department_id = searchParams.get("to_department_id")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("date_from")) filters.date_from = searchParams.get("date_from")!;
    if (searchParams.get("date_to")) filters.date_to = searchParams.get("date_to")!;

    const hasFilters = Object.keys(filters).length > 0;
    const releasings = await releasingService.getReleasings(hasFilters ? filters : undefined);
    return apiSuccess(releasings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch releasings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/releasings", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.date_released) {
      return apiError("date_released is required", 400);
    }

    const releasing = await releasingService.createReleasing({
      date_released: new Date(body.date_released),
      from_location_id: body.from_location_id,
      to_department_id: body.to_department_id,
      remarks: body.remarks,
    });
    return apiSuccess(releasing, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create releasing");
  }
}
