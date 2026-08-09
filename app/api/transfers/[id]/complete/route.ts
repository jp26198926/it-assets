import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as transferService from "@/lib/services/transfer-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/transfers", "Edit");
    if (error) return error;

    const { id } = await params;
    await transferService.completeTransfer(id);
    return apiSuccess({ message: "Transfer completed successfully" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to complete transfer");
  }
}
