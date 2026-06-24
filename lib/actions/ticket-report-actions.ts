"use server";

import * as ticketReportService from "@/lib/services/ticket-report-service";
import type { TicketReportFilters } from "@/lib/types/ticket-report";

export async function getFilteredTickets(filters: TicketReportFilters) {
  return ticketReportService.getFilteredTickets(filters);
}

export async function getTicketSummary(filters: TicketReportFilters) {
  return ticketReportService.getTicketSummary(filters);
}

export async function getTicketTotals(filters: TicketReportFilters) {
  return ticketReportService.getTicketTotals(filters);
}
