import { NextRequest } from "next/server";
import * as mailService from "@/lib/services/mail-service";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/mail", "Access");
    if (error) return error;

    const body = await request.json();
    const { recipientEmail } = body;

    if (!recipientEmail) {
      return apiError("Recipient email is required", 400);
    }

    const result = await mailService.sendTestEmail(recipientEmail);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to send test email", 500);
  }
}
