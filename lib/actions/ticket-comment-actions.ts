"use server";

import * as ticketCommentService from "@/lib/services/ticket-comment-service";
import { getAuthFromRequest } from "@/lib/services/api-auth";
import type { CreateTicketCommentInput, TicketComment } from "@/lib/types/ticket-comment";

export async function createTicketComment(data: CreateTicketCommentInput): Promise<TicketComment> {
  const user = await getAuthFromRequest();
  return ticketCommentService.createTicketComment(data, user?.userId || null);
}

export async function getTicketComments(
  ticketId: string,
  limit?: number,
  skip?: number
): Promise<TicketComment[]> {
  return ticketCommentService.getTicketCommentsByTicketId(ticketId, limit, skip);
}

export async function getTicketCommentTotal(ticketId: string): Promise<number> {
  return ticketCommentService.getTicketCommentCount(ticketId);
}
