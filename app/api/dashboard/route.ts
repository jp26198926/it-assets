import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import { getDashboardStats } from "@/lib/services/dashboard-service";

export async function GET() {
  try {
    const { error } = await withPageAuth("/dashboard", "Access");
    if (error) return error;

    const stats = await getDashboardStats();
    return apiSuccess(stats);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch dashboard stats");
  }
}
