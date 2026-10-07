import { NextRequest } from "next/server";
import { uploadFile } from "@/lib/services/cloudinary-service";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/cloudinary", "Access");
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = (formData.get("fileName") as string) || "test-upload";

    if (!file) {
      return apiError("No file provided", 400);
    }

    const result = await uploadFile(file, fileName, "it-assets/test", "test");
    return apiSuccess(result);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to upload test file", 500);
  }
}
