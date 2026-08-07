"use server";

import * as receivingItemService from "@/lib/services/receiving-item-service";
import type { CreateReceivingItemInput, UpdateReceivingItemInput, ReceivingItem } from "@/lib/types/receiving-item";

export async function getReceivingItems(receivingId: string): Promise<ReceivingItem[]> {
  return receivingItemService.getReceivingItems(receivingId);
}

export async function getReceivingItemById(id: string): Promise<ReceivingItem | null> {
  return receivingItemService.getReceivingItemById(id);
}

export async function createReceivingItem(data: CreateReceivingItemInput): Promise<ReceivingItem> {
  return receivingItemService.createReceivingItem(data);
}

export async function updateReceivingItem(id: string, data: UpdateReceivingItemInput): Promise<ReceivingItem> {
  return receivingItemService.updateReceivingItem(id, data);
}

export async function deleteReceivingItem(id: string, reason?: string): Promise<void> {
  return receivingItemService.deleteReceivingItem(id, reason);
}
