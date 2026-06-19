import { connectDB } from "@/lib/db/connection";
import { Cloudinary as CloudinaryModel } from "@/lib/db/models/cloudinary";
import type { UpdateCloudinaryInput, Cloudinary } from "@/lib/types/cloudinary";
import { v2 as cloudinary } from "cloudinary";

function toCloudinary(d: Record<string, unknown>): Cloudinary {
  return {
    id: (d._id as { toString(): string }).toString(),
    cloud_name: (d.cloud_name as string) ?? "",
    api_key: (d.api_key as string) ?? "",
    api_secret: (d.api_secret as string) ?? "",
    created_at: d.created_at as Date,
    created_by: d.created_by ? (d.created_by as { toString(): string }).toString() : null,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by: d.updated_by ? (d.updated_by as { toString(): string }).toString() : null,
    deleted_at: (d.deleted_at as Date) ?? null,
  };
}

export async function getCloudinarySettings(): Promise<Cloudinary> {
  await connectDB();

  let settings = await CloudinaryModel.findOne().lean();

  if (!settings) {
    settings = await CloudinaryModel.create({
      cloud_name: "",
      api_key: "",
      api_secret: "",
    });
    settings = settings.toObject();
  }

  return toCloudinary(settings as unknown as Record<string, unknown>);
}

export async function updateCloudinarySettings(data: UpdateCloudinaryInput): Promise<Cloudinary> {
  await connectDB();

  const current = await CloudinaryModel.findOne().lean();
  if (!current) throw new Error("Cloudinary settings not found");

  const updateData: Record<string, unknown> = {};
  if (data.cloud_name !== undefined) updateData.cloud_name = data.cloud_name;
  if (data.api_key !== undefined) updateData.api_key = data.api_key;
  if (data.api_secret !== undefined) updateData.api_secret = data.api_secret;
  updateData.updated_at = new Date();

  const updated = await CloudinaryModel.findByIdAndUpdate(
    current._id,
    { $set: updateData },
    { new: true }
  ).lean();

  if (!updated) throw new Error("Failed to update Cloudinary settings");

  return toCloudinary(updated as unknown as Record<string, unknown>);
}

export async function testCloudinaryUpload(
  fileBase64: string,
  fileName: string
): Promise<{ success: boolean; message: string; url?: string }> {
  const settings = await getCloudinarySettings();

  if (!settings.cloud_name || !settings.api_key || !settings.api_secret) {
    return { success: false, message: "Cloudinary credentials are not fully configured" };
  }

  cloudinary.config({
    cloud_name: settings.cloud_name,
    api_key: settings.api_key,
    api_secret: settings.api_secret,
  });

  const result = await cloudinary.uploader.upload(fileBase64, {
    folder: "it-assets/test",
    public_id: `test_${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}`,
  });

  return {
    success: true,
    message: "File uploaded successfully",
    url: result.secure_url,
  };
}
