"use server";

import * as releasingItemService from "@/lib/services/releasing-item-service";
import type { CreateReleasingItemInput, UpdateReleasingItemInput, ReleasingItem } from "@/lib/types/releasing-item";

export async function getReleasingItems(releasingId: string): Promise<ReleasingItem[]> {
  return releasingItemService.getReleasingItems(releasingId);
}

export async function getReleasingItemById(id: string): Promise<ReleasingItem | null> {
  return releasingItemService.getReleasingItemById(id);
}

export async function createReleasingItem(data: CreateReleasingItemInput): Promise<ReleasingItem> {
  return releasingItemService.createReleasingItem(data);
}

export async function updateReleasingItem(id: string, data: UpdateReleasingItemInput): Promise<ReleasingItem> {
  return releasingItemService.updateReleasingItem(id, data);
}

export async function deleteReleasingItem(id: string, reason?: string): Promise<void> {
  return releasingItemService.deleteReleasingItem(id, reason);
}
