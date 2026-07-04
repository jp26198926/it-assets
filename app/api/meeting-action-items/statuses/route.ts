import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function GET(_request: NextRequest) {
  try {
    const { error } = await withPageAuth("/meeting-action-items", "Access");
    if (error) return error;

    const statuses = [
      { value: "Pending", label: "Pending" },
      { value: "In Progress", label: "In Progress" },
      { value: "Completed", label: "Completed" },
      { value: "Cancelled", label: "Cancelled" },
    ];
    return apiSuccess(statuses);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch statuses");
  }
}
