import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as roleService from "@/lib/services/role-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/roles", "Restore");
    if (error) return error;

    const { id } = await params;
    await roleService.restoreRole(id);
    return apiSuccess({ message: "Role restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore role");
  }
}
