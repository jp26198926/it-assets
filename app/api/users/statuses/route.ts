import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as userService from "@/lib/services/user-service";

export async function GET() {
  try {
    const statuses = await userService.getUserStatuses();
    return apiSuccess(statuses);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch user statuses");
  }
}
