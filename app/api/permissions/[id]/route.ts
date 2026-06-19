import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as permissionService from "@/lib/services/permission-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const permission = await permissionService.getPermissionById(id);
    if (!permission) return apiError("Permission not found", 404);
    return apiSuccess(permission);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch permission");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const permission = await permissionService.updatePermission(id, {
      name: body.name,
      description: body.description,
    });

    return apiSuccess(permission);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update permission");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await permissionService.deletePermission(id, reason);
    return apiSuccess({ message: "Permission deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete permission");
  }
}
