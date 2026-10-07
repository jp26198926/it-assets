import { NextRequest } from "next/server";
import { uploadFile } from "@/lib/services/cloudinary-service";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import { getAuthFromRequest } from "@/lib/services/api-auth";

const ALLOWED_FOLDERS: Record<string, string> = {
  "it-assets/items": "item",
  "it-assets/avatars": "avatar",
  "it-assets/branding": "branding",
  "it-assets/test": "test",
};

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthFromRequest();
    if (!user) {
      return apiError("Not authenticated", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = (formData.get("fileName") as string) || "upload";
    const folder = formData.get("folder") as string;

    if (!file) {
      return apiError("No file provided", 400);
    }

    if (!folder || !ALLOWED_FOLDERS[folder]) {
      return apiError("Invalid upload folder", 400);
    }

    const result = await uploadFile(file, fileName, folder, ALLOWED_FOLDERS[folder]);

    if (!result.success || !result.url) {
      return apiError(result.message, result.message.includes("exceeds") ? 400 : 500);
    }

    return apiSuccess({ url: result.url });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Failed to upload file", 500);
  }
}
