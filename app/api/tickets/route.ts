import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as ticketService from "@/lib/services/ticket-service";
import type { TicketFilters } from "@/lib/types/ticket";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/tickets", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: TicketFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("email")) filters.email = searchParams.get("email")!;
    if (searchParams.get("ticket_no")) filters.ticket_no = searchParams.get("ticket_no")!;
    if (searchParams.get("category_id")) filters.category_id = searchParams.get("category_id")!;
    if (searchParams.get("priority")) filters.priority = searchParams.get("priority")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("assigned_to")) filters.assigned_to = searchParams.get("assigned_to")!;
    if (searchParams.get("department_id")) filters.department_id = searchParams.get("department_id")!;

    const hasFilters = Object.keys(filters).length > 0;
    const tickets = await ticketService.getTickets(hasFilters ? filters : undefined);
    return apiSuccess(tickets);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch tickets");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/tickets", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }
    if (!body.email || typeof body.email !== "string") {
      return apiError("email is required", 400);
    }
    if (!body.title || typeof body.title !== "string") {
      return apiError("title is required", 400);
    }
    if (!body.description || typeof body.description !== "string") {
      return apiError("description is required", 400);
    }
    if (!body.category_id || typeof body.category_id !== "string") {
      return apiError("category_id is required", 400);
    }

    const ticket = await ticketService.createTicket({
      name: body.name,
      email: body.email,
      title: body.title,
      description: body.description,
      category_id: body.category_id,
      department_id: body.department_id,
      priority: body.priority,
      asset_id: body.asset_id,
      assigned_to: body.assigned_to,
      attachments: body.attachments,
    });
    return apiSuccess(ticket, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create ticket");
  }
}
