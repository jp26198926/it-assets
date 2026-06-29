"use server";

import * as ticketService from "@/lib/services/ticket-service";
import { getLogsByTicketId, getTicketStatusLogCount } from "@/lib/services/ticket-status-log-service";
import { getAuthFromRequest } from "@/lib/services/api-auth";
import type { CreateTicketInput, UpdateTicketInput, TicketFilters, Ticket } from "@/lib/types/ticket";
import type { TicketStatusLog } from "@/lib/types/ticket-status-log";

export async function getTickets(filters?: TicketFilters): Promise<Ticket[]> {
  const user = await getAuthFromRequest();
  return ticketService.getTickets(filters, user ? { userId: user.userId, role: user.role } : null);
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const user = await getAuthFromRequest();
  return ticketService.getTicketById(id, user ? { userId: user.userId, role: user.role } : null);
}

export async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  const user = await getAuthFromRequest();
  return ticketService.createTicket(data, user?.userId || null);
}

export async function updateTicket(id: string, data: UpdateTicketInput): Promise<Ticket> {
  const user = await getAuthFromRequest();
  return ticketService.updateTicket(id, data, user?.userId || null);
}

export async function deleteTicket(id: string, reason?: string): Promise<void> {
  const user = await getAuthFromRequest();
  return ticketService.deleteTicket(id, user?.userId || null, reason);
}

export async function restoreTicket(id: string): Promise<void> {
  return ticketService.restoreTicket(id);
}

export async function getTicketSelectOptions(): Promise<{
  categories: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  assets: { id: string; barcode: string; itemName: string }[];
  users: { id: string; name: string }[];
}> {
  return ticketService.getTicketSelectOptions();
}

export async function getActiveTicketCategories(): Promise<{ id: string; name: string }[]> {
  return ticketService.getActiveTicketCategories();
}

export async function getTicketStatusLogs(ticketId: string, limit?: number, skip?: number): Promise<TicketStatusLog[]> {
  return getLogsByTicketId(ticketId, limit, skip);
}

export async function getTicketStatusLogTotal(ticketId: string): Promise<number> {
  return getTicketStatusLogCount(ticketId);
}
