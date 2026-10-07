import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/services/cloudinary-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = (formData.get("fileName") as string) || "upload";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const result = await uploadFile(file, fileName, "it-assets/meetings", "meeting");

    if (!result.success || !result.url) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: result.message.includes("exceeds") ? 400 : 500 }
      );
    }

    return NextResponse.json({ success: true, url: result.url }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
