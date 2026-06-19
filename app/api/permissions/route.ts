import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as permissionService from "@/lib/services/permission-service";
import type { PermissionFilters } from "@/lib/types/permission";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: PermissionFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("description")) filters.description = searchParams.get("description")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const permissions = await permissionService.getPermissions(hasFilters ? filters : undefined);
    return apiSuccess(permissions);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch permissions");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const permission = await permissionService.createPermission({
      name: body.name,
      description: body.description,
    });

    return apiSuccess(permission, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create permission");
  }
}
