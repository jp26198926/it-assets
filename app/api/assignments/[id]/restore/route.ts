import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as assignmentService from "@/lib/services/assignment-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/assignments", "Restore");
    if (error) return error;

    const { id } = await params;
    await assignmentService.restoreAssignment(id);
    return apiSuccess({ message: "Assignment restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore assignment");
  }
}
