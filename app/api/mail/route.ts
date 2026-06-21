import { NextRequest } from "next/server";
import * as mailService from "@/lib/services/mail-service";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function GET() {
  try {
    const { error } = await withPageAuth("/mail", "Access");
    if (error) return error;

    const settings = await mailService.getMailSettings();
    return apiSuccess(settings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to get mail settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/mail", "Edit");
    if (error) return error;

    const body = await request.json();
    const settings = await mailService.updateMailSettings(body);
    return apiSuccess(settings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update mail settings", 500);
  }
}
