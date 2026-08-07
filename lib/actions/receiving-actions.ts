"use server";

import * as receivingService from "@/lib/services/receiving-service";
import type { CreateReceivingInput, UpdateReceivingInput, ReceivingFilters, Receiving } from "@/lib/types/receiving";

export async function getReceivings(filters?: ReceivingFilters): Promise<Receiving[]> {
  return receivingService.getReceivings(filters);
}

export async function getReceivingById(id: string): Promise<Receiving | null> {
  return receivingService.getReceivingById(id);
}

export async function createReceiving(data: CreateReceivingInput): Promise<Receiving> {
  return receivingService.createReceiving(data);
}

export async function updateReceiving(id: string, data: UpdateReceivingInput): Promise<Receiving> {
  return receivingService.updateReceiving(id, data);
}

export async function cancelReceiving(id: string): Promise<void> {
  return receivingService.cancelReceiving(id);
}

export async function completeReceiving(id: string): Promise<void> {
  return receivingService.completeReceiving(id);
}

export async function deleteReceiving(id: string, reason?: string): Promise<void> {
  return receivingService.deleteReceiving(id, reason);
}
