import { NextRequest, NextResponse } from "next/server";
import { getCloudinarySettings } from "@/lib/services/cloudinary-service";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export async function POST(request: NextRequest) {
  try {
    const settings = await getCloudinarySettings();

    if (!settings.cloud_name || !settings.api_key || !settings.api_secret) {
      return NextResponse.json({ success: false, error: "Cloudinary credentials are not configured" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = (formData.get("fileName") as string) || "upload";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const maxBytes = (settings.max_file_size || 10) * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { success: false, error: `File size exceeds the maximum allowed size of ${settings.max_file_size || 10} MB` },
        { status: 400 }
      );
    }

    cloudinary.config({
      cloud_name: settings.cloud_name,
      api_key: settings.api_key,
      api_secret: settings.api_secret,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitized = fileName.replace(/\.[^/.]+$/, "");

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "it-assets/tickets",
          public_id: `ticket_${Date.now()}_${sanitized}`,
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error("Upload returned no result"));
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ success: true, url: result.secure_url }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}
