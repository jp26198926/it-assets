"use server";

import * as itemService from "@/lib/services/item-service";
import type { CreateItemInput, UpdateItemInput, ItemFilters, Item } from "@/lib/types/item";

export async function getItems(filters?: ItemFilters): Promise<Item[]> {
  return itemService.getItems(filters);
}

export async function getItemById(id: string): Promise<Item | null> {
  return itemService.getItemById(id);
}

export async function createItem(data: CreateItemInput): Promise<Item> {
  return itemService.createItem(data);
}

export async function updateItem(id: string, data: UpdateItemInput): Promise<Item> {
  return itemService.updateItem(id, data);
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
