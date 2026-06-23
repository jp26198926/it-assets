import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function GET(_request: NextRequest) {
  try {
    const { error } = await withPageAuth("/tickets", "Access");
    if (error) return error;

    const statuses = [
      { value: "Open", label: "Open" },
      { value: "In Progress", label: "In Progress" },
      { value: "Resolved", label: "Resolved" },
      { value: "Closed", label: "Closed" },
      { value: "Deleted", label: "Deleted" },
    ];
    return apiSuccess(statuses);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch statuses");
  }
}
