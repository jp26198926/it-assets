import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as ticketService from "@/lib/services/ticket-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/tickets", "Restore");
    if (error) return error;

    const { id } = await params;
    await ticketService.restoreTicket(id);
    return apiSuccess({ message: "Ticket restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore ticket");
  }
}
