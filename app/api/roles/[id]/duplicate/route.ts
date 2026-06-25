import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as roleService from "@/lib/services/role-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/roles", "Add");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const role = await roleService.duplicateRole(id, {
      name: body.name,
      description: body.description,
    });

    return apiSuccess(role, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to duplicate role");
  }
}
