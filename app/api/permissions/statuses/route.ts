import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as permissionService from "@/lib/services/permission-service";

export async function GET() {
  try {
    const statuses = await permissionService.getPermissionStatuses();
    return apiSuccess(statuses);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch permission statuses");
  }
}
