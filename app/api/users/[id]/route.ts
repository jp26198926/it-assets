import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as userService from "@/lib/services/user-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/users", "Access");
    if (error) return error;

    const { id } = await params;
    const user = await userService.getUserById(id);
    if (!user) return apiError("User not found", 404);
    return apiSuccess(user);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch user");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/users", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const user = await userService.updateUser(id, {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      department_id: body.department_id,
      role_id: body.role_id,
    });

    return apiSuccess(user);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update user");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/users", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await userService.deleteUser(id, reason);
    return apiSuccess({ message: "User deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete user");
  }
}
