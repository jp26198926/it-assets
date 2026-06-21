import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as uomService from "@/lib/services/uom-service";
import type { UOMFilters } from "@/lib/types/uom";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/uoms", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: UOMFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("code")) filters.code = searchParams.get("code")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const uoms = await uomService.getUOMs(hasFilters ? filters : undefined);
    return apiSuccess(uoms);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch UOMs");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/uoms", "Add");
    if (error) return error;

    const body = await request.json();

    if (!body.code || typeof body.code !== "string") {
      return apiError("code is required", 400);
    }

    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const uom = await uomService.createUOM({
      code: body.code,
      name: body.name,
    });

    return apiSuccess(uom, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create UOM");
  }
}
