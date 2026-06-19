import { NextRequest } from "next/server";
import * as smsService from "@/lib/services/sms-service";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";

export async function GET() {
  try {
    const settings = await smsService.getSmsSettings();
    return apiSuccess(settings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to get SMS settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = await smsService.updateSmsSettings(body);
    return apiSuccess(settings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update SMS settings", 500);
  }
}
