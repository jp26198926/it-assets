import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as roleService from "@/lib/services/role-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/roles", "Access");
    if (error) return error;

    const { id } = await params;
    const role = await roleService.getRoleById(id);
    if (!role) return apiError("Role not found", 404);
    return apiSuccess(role);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch role");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/roles", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const role = await roleService.updateRole(id, {
      name: body.name,
      description: body.description,
    });

    return apiSuccess(role);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update role");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/roles", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await roleService.deleteRole(id, reason);
    return apiSuccess({ message: "Role deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete role");
  }
}
