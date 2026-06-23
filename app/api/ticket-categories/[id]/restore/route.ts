import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as ticketCategoryService from "@/lib/services/ticket-category-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/ticket-categories", "Restore");
    if (error) return error;

    const { id } = await params;
    await ticketCategoryService.restoreTicketCategory(id);
    return apiSuccess({ message: "Ticket category restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore ticket category");
  }
}
