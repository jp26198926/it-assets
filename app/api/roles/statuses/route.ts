import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as roleService from "@/lib/services/role-service";

export async function GET() {
  try {
    const statuses = await roleService.getRoleStatuses();
    return apiSuccess(statuses);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch role statuses");
  }
}
