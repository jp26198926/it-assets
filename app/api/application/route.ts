import { NextRequest } from "next/server";
import * as applicationService from "@/lib/services/application-service";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function GET() {
  try {
    const { error } = await withPageAuth("/application", "Access");
    if (error) return error;

    const settings = await applicationService.getAppSettings();
    return apiSuccess(settings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to get application settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/application", "Edit");
    if (error) return error;

    const body = await request.json();
    const settings = await applicationService.updateAppSettings(body);
    return apiSuccess(settings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update application settings", 500);
  }
}
