"use server";

import * as applicationService from "@/lib/services/application-service";
import type { UpdateApplicationInput, Application } from "@/lib/types/application";

export async function getAppSettings(): Promise<Application> {
  return applicationService.getAppSettings();
}

export async function updateAppSettings(data: UpdateApplicationInput): Promise<Application> {
  return applicationService.updateAppSettings(data);
}

export async function uploadAppImage(
  fileBase64: string,
  fileName: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  const { uploadToCloudinary } = await import("@/lib/services/cloudinary-service");
  const result = await uploadToCloudinary(fileBase64, fileName, "it-assets/branding", "branding");
  if (result.success && result.url) {
    return { success: true, url: result.url };
  }
  return { success: false, error: result.message };
}
