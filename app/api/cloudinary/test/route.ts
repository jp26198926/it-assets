import { NextRequest } from "next/server";
import * as cloudinaryService from "@/lib/services/cloudinary-service";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/cloudinary", "Access");
    if (error) return error;

    const body = await request.json();
    const { fileBase64, fileName } = body;

    if (!fileBase64 || !fileName) {
      return apiError("File data and name are required", 400);
    }

    const result = await cloudinaryService.testCloudinaryUpload(fileBase64, fileName);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to upload test file", 500);
  }
}
