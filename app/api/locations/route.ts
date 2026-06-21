import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as locationService from "@/lib/services/location-service";
import type { LocationFilters } from "@/lib/types/location";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: LocationFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const locations = await locationService.getLocations(hasFilters ? filters : undefined);
    return apiSuccess(locations);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch locations");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const location = await locationService.createLocation({
      name: body.name,
    });

    return apiSuccess(location, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create location");
  }
}
