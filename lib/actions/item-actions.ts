"use server";

import * as itemService from "@/lib/services/item-service";
import { getAuthFromRequest } from "@/lib/services/api-auth";
import type { CreateItemInput, UpdateItemInput, ItemFilters, Item } from "@/lib/types/item";

export async function getItems(filters?: ItemFilters): Promise<Item[]> {
  return itemService.getItems(filters);
}

export async function getItemById(id: string): Promise<Item | null> {
  return itemService.getItemById(id);
}

export async function createItem(data: CreateItemInput): Promise<Item> {
  const user = await getAuthFromRequest();
  return itemService.createItem({
    ...data,
    created_by: user?.userId || null,
  });
}

export async function updateItem(id: string, data: UpdateItemInput): Promise<Item> {
  const user = await getAuthFromRequest();
  return itemService.updateItem(id, {
    ...data,
    updated_by: user?.userId || null,
  });
}

export async function deleteItem(id: string, reason?: string): Promise<void> {
  return itemService.deleteItem(id, reason);
}

export async function restoreItem(id: string): Promise<void> {
  return itemService.restoreItem(id);
}

export async function getItemSelectOptions(): Promise<{
  categories: { id: string; name: string }[];
  uoms: { id: string; name: string; code: string }[];
}> {
  return itemService.getItemSelectOptions();
}

export async function uploadItemImage(
  fileBase64: string,
  fileName: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  const { v2: cloudinary } = await import("cloudinary");
  const cloudinaryService = await import("@/lib/services/cloudinary-service");
  const settings = await cloudinaryService.getCloudinarySettings();

  if (!settings.cloud_name || !settings.api_key || !settings.api_secret) {
    return { success: false, error: "Cloudinary credentials are not configured" };
  }

  cloudinary.config({
    cloud_name: settings.cloud_name,
    api_key: settings.api_key,
    api_secret: settings.api_secret,
  });

  try {
    const sanitized = fileName.replace(/\.[^/.]+$/, "");
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: "it-assets/items",
      public_id: `item_${Date.now()}_${sanitized}`,
    });

    return { success: true, url: result.secure_url };
  } catch {
    return { success: false, error: "Failed to upload image" };
  }
}
