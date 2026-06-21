import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function GET(_request: NextRequest) {
  try {
    const { error } = await withPageAuth("/items", "Access");
    if (error) return error;

    const statuses = [
      { value: "Active", label: "Active" },
      { value: "Deleted", label: "Deleted" },
    ];
    return apiSuccess(statuses);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch statuses");
  }
}
