"use server";

import * as ticketCategoryService from "@/lib/services/ticket-category-service";
import type { CreateTicketCategoryInput, UpdateTicketCategoryInput, TicketCategoryFilters, TicketCategory } from "@/lib/types/ticket-category";

export async function getTicketCategories(filters?: TicketCategoryFilters): Promise<TicketCategory[]> {
  return ticketCategoryService.getTicketCategories(filters);
}

export async function getTicketCategoryById(id: string): Promise<TicketCategory | null> {
  return ticketCategoryService.getTicketCategoryById(id);
}

export async function createTicketCategory(data: CreateTicketCategoryInput): Promise<TicketCategory> {
  return ticketCategoryService.createTicketCategory(data);
}

export async function updateTicketCategory(id: string, data: UpdateTicketCategoryInput): Promise<TicketCategory> {
  return ticketCategoryService.updateTicketCategory(id, data);
}

export async function deleteTicketCategory(id: string, reason?: string): Promise<void> {
  return ticketCategoryService.deleteTicketCategory(id, reason);
}

export async function restoreTicketCategory(id: string): Promise<void> {
  return ticketCategoryService.restoreTicketCategory(id);
}
