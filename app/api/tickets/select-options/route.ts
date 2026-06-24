import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as ticketService from "@/lib/services/ticket-service";

export async function GET() {
  try {
    const { error } = await withPageAuth("/tickets", "Access");
    if (error) return error;

    const options = await ticketService.getTicketSelectOptions();
    return apiSuccess(options);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch select options");
  }
}
