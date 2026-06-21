import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function GET(_request: NextRequest) {
  try {
    const { error } = await withPageAuth("/assets", "Access");
    if (error) return error;

    const statuses = [
      { value: "Available", label: "Available" },
      { value: "Assigned", label: "Assigned" },
      { value: "Repair", label: "Repair" },
      { value: "Lost", label: "Lost" },
      { value: "Disposed", label: "Disposed" },
    ];
    return apiSuccess(statuses);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch statuses");
  }
}
