import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as departmentService from "@/lib/services/department-service";

export async function GET() {
  try {
    const statuses = await departmentService.getDepartmentStatuses();
    return apiSuccess(statuses);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch department statuses");
  }
}
