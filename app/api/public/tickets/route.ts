import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as ticketService from "@/lib/services/ticket-service";

export async function POST(request: NextRequest) {
  try {
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
      department_id: body.department_id || undefined,
      priority: body.priority || "Low",
      asset_id: body.asset_id || undefined,
      attachments: body.attachments || [],
    });
    return apiSuccess(ticket, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create ticket");
  }
}
