import { NextRequest } from "next/server";
import * as smsService from "@/lib/services/sms-service";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/sms", "Access");
    if (error) return error;

    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return apiError("Phone number is required", 400);
    }

    const result = await smsService.sendTestSms(phoneNumber);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to send test SMS", 500);
  }
}
