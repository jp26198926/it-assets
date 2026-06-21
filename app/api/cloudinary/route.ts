import { NextRequest } from "next/server";
import * as cloudinaryService from "@/lib/services/cloudinary-service";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function GET() {
  try {
    const { error } = await withPageAuth("/cloudinary", "Access");
    if (error) return error;

    const settings = await cloudinaryService.getCloudinarySettings();
    return apiSuccess(settings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to get Cloudinary settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/cloudinary", "Edit");
    if (error) return error;

    const body = await request.json();
    const settings = await cloudinaryService.updateCloudinarySettings(body);
    return apiSuccess(settings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update Cloudinary settings", 500);
  }
}
