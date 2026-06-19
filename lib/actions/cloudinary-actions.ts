"use server";

import * as cloudinaryService from "@/lib/services/cloudinary-service";
import type { UpdateCloudinaryInput, Cloudinary } from "@/lib/types/cloudinary";

export async function getCloudinarySettings(): Promise<Cloudinary> {
  return cloudinaryService.getCloudinarySettings();
}

export async function updateCloudinarySettings(data: UpdateCloudinaryInput): Promise<Cloudinary> {
  return cloudinaryService.updateCloudinarySettings(data);
}

export async function testCloudinaryUpload(
  fileBase64: string,
  fileName: string
): Promise<{ success: boolean; message: string; url?: string }> {
  return cloudinaryService.testCloudinaryUpload(fileBase64, fileName);
}
