import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as pageService from "@/lib/services/page-service";

export async function GET() {
  try {
    const statuses = await pageService.getPageStatuses();
    return apiSuccess(statuses);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch page statuses");
  }
}
