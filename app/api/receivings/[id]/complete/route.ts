import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as receivingService from "@/lib/services/receiving-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/receivings", "Edit");
    if (error) return error;

    const { id } = await params;
    await receivingService.completeReceiving(id);
    return apiSuccess({ message: "Receiving completed successfully" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to complete receiving");
  }
}
