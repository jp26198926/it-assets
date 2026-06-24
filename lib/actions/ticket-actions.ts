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

export async function uploadTicketAttachment(
  fileBase64: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const { v2: cloudinary } = await import("cloudinary");
  const cloudinaryService = await import("@/lib/services/cloudinary-service");
  const settings = await cloudinaryService.getCloudinarySettings();

  if (!settings.cloud_name || !settings.api_key || !settings.api_secret) {
    return { success: false, error: "Cloudinary credentials are not configured" };
  }

  cloudinary.config({
    cloud_name: settings.cloud_name,
    api_key: settings.api_key,
    api_secret: settings.api_secret,
  });

  try {
    const sanitized = fileName.replace(/\.[^/.]+$/, "");
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: "it-assets/tickets",
      public_id: `ticket_${Date.now()}_${sanitized}`,
    });

    return { success: true, url: result.secure_url };
  } catch {
    return { success: false, error: "Failed to upload attachment" };
  }
}
