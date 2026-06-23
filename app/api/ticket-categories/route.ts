import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as ticketCategoryService from "@/lib/services/ticket-category-service";
import type { TicketCategoryFilters } from "@/lib/types/ticket-category";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/ticket-categories", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: TicketCategoryFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const ticketCategories = await ticketCategoryService.getTicketCategories(hasFilters ? filters : undefined);
    return apiSuccess(ticketCategories);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch ticket categories");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/ticket-categories", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const ticketCategory = await ticketCategoryService.createTicketCategory({
      name: body.name,
    });
    return apiSuccess(ticketCategory, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create ticket category");
  }
}
