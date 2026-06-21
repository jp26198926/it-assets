import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as rolePermissionService from "@/lib/services/role-permission-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/roles", "Access");
    if (error) return error;

    const { id } = await params;
    const records = await rolePermissionService.getRolePermissions(id);
    return apiSuccess(records);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch role permissions");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/roles", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    if (!body.page_id || !body.permission_id) {
      return apiError("page_id and permission_id are required", 400);
    }

    await rolePermissionService.createRolePermission(id, {
      page_id: body.page_id,
      permission_id: body.permission_id,
    });

    return apiSuccess({ message: "Permission added" }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to add permission");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/roles", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    if (!body.page_id || !body.permission_id) {
      return apiError("page_id and permission_id are required", 400);
    }

    await rolePermissionService.deleteRolePermission(id, body.page_id, body.permission_id);
    return apiSuccess({ message: "Permission removed" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to remove permission");
  }
}
