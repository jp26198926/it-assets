import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as pageService from "@/lib/services/page-service";

export async function GET() {
  try {
    const pages = await pageService.getSidebarPages();
    return apiSuccess(pages);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch sidebar pages");
  }
}
