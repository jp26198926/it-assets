import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as ticketService from "@/lib/services/ticket-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await withPageAuth("/tickets", "Access");
    if (error) return error;

    const { id } = await params;
    const user = auth.user ? { userId: auth.user.userId, role: auth.user.role } : null;
    const ticket = await ticketService.getTicketById(id, user);
    if (!ticket) return apiError("Ticket not found", 404);
    return apiSuccess(ticket);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch ticket");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await withPageAuth("/tickets", "Edit");
    if (error) return error;

    const { id } = await params;
    const user = auth.user ? { userId: auth.user.userId, role: auth.user.role } : null;
    const existing = await ticketService.getTicketById(id, user);
    if (!existing) return apiError("Ticket not found or access denied", 404);

    const body = await request.json();

    const ticket = await ticketService.updateTicket(id, {
      name: body.name,
      email: body.email,
      title: body.title,
      description: body.description,
      category_id: body.category_id,
      department_id: body.department_id,
      priority: body.priority,
      asset_id: body.asset_id,
      assigned_to: body.assigned_to,
      status: body.status,
      attachments: body.attachments,
    });
    return apiSuccess(ticket);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update ticket");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await withPageAuth("/tickets", "Delete");
    if (error) return error;

    const { id } = await params;
    const user = auth.user ? { userId: auth.user.userId, role: auth.user.role } : null;
    const existing = await ticketService.getTicketById(id, user);
    if (!existing) return apiError("Ticket not found or access denied", 404);

    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await ticketService.deleteTicket(id, undefined, reason);
    return apiSuccess({ message: "Ticket deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete ticket");
  }
}
