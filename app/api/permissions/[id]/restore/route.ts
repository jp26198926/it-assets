import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as permissionService from "@/lib/services/permission-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await permissionService.restorePermission(id);
    return apiSuccess({ message: "Permission restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore permission");
  }
}
