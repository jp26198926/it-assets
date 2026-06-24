import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as ticketReportService from "@/lib/services/ticket-report-service";
import type { TicketReportFilters } from "@/lib/types/ticket-report";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/ticket-report", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: TicketReportFilters = {};
    if (searchParams.get("date_from")) filters.date_from = searchParams.get("date_from")!;
    if (searchParams.get("date_to")) filters.date_to = searchParams.get("date_to")!;
    if (searchParams.get("technician_id")) filters.technician_id = searchParams.get("technician_id")!;
    if (searchParams.get("department_id")) filters.department_id = searchParams.get("department_id")!;
    if (searchParams.get("requestor_id")) filters.requestor_id = searchParams.get("requestor_id")!;

    const totals = await ticketReportService.getTicketTotals(filters);
    return apiSuccess(totals);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch ticket totals");
  }
}
