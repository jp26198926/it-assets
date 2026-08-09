"use server";

import * as transferItemService from "@/lib/services/transfer-item-service";
import type { CreateTransferItemInput, UpdateTransferItemInput, TransferItem } from "@/lib/types/transfer-item";

export async function getTransferItems(transferId: string): Promise<TransferItem[]> {
  return transferItemService.getTransferItems(transferId);
}

export async function getTransferItemById(id: string): Promise<TransferItem | null> {
  return transferItemService.getTransferItemById(id);
}

export async function createTransferItem(data: CreateTransferItemInput): Promise<TransferItem> {
  return transferItemService.createTransferItem(data);
}

export async function updateTransferItem(id: string, data: UpdateTransferItemInput): Promise<TransferItem> {
  return transferItemService.updateTransferItem(id, data);
}

export async function deleteTransferItem(id: string, reason?: string): Promise<void> {
  return transferItemService.deleteTransferItem(id, reason);
}
