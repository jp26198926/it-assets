import { NextRequest } from "next/server";
import { uploadTicketAttachment } from "@/lib/services/cloudinary-service";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = (formData.get("fileName") as string) || "upload";

    if (!file) {
      return apiError("No file provided", 400);
    }

    const result = await uploadTicketAttachment(file, fileName);

    if (!result.success || !result.url) {
      return apiError(result.message, result.message.includes("exceeds") ? 400 : 500);
    }

    return apiSuccess({ url: result.url });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Failed to upload file", 500);
  }
}
