import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as ticketCategoryService from "@/lib/services/ticket-category-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/ticket-categories", "Access");
    if (error) return error;

    const { id } = await params;
    const ticketCategory = await ticketCategoryService.getTicketCategoryById(id);
    if (!ticketCategory) return apiError("Ticket category not found", 404);
    return apiSuccess(ticketCategory);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch ticket category");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/ticket-categories", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const ticketCategory = await ticketCategoryService.updateTicketCategory(id, {
      name: body.name,
    });
    return apiSuccess(ticketCategory);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update ticket category");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/ticket-categories", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await ticketCategoryService.deleteTicketCategory(id, reason);
    return apiSuccess({ message: "Ticket category deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete ticket category");
  }
}
