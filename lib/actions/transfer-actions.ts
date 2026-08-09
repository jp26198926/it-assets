"use server";

import * as transferService from "@/lib/services/transfer-service";
import type { CreateTransferInput, UpdateTransferInput, TransferFilters, Transfer } from "@/lib/types/transfer";

export async function getTransfers(filters?: TransferFilters): Promise<Transfer[]> {
  return transferService.getTransfers(filters);
}

export async function getTransferById(id: string): Promise<Transfer | null> {
  return transferService.getTransferById(id);
}

export async function createTransfer(data: CreateTransferInput): Promise<Transfer> {
  return transferService.createTransfer(data);
}

export async function updateTransfer(id: string, data: UpdateTransferInput): Promise<Transfer> {
  return transferService.updateTransfer(id, data);
}

export async function cancelTransfer(id: string): Promise<void> {
  return transferService.cancelTransfer(id);
}

export async function completeTransfer(id: string): Promise<void> {
  return transferService.completeTransfer(id);
}

export async function deleteTransfer(id: string, reason?: string): Promise<void> {
  return transferService.deleteTransfer(id, reason);
}
