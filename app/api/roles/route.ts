import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as roleService from "@/lib/services/role-service";
import type { RoleFilters } from "@/lib/types/role";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: RoleFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("description")) filters.description = searchParams.get("description")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const roles = await roleService.getRoles(hasFilters ? filters : undefined);
    return apiSuccess(roles);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch roles");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const role = await roleService.createRole({
      name: body.name,
      description: body.description,
    });

    return apiSuccess(role, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create role");
  }
}
