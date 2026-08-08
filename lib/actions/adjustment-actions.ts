"use server";

import * as adjustmentService from "@/lib/services/adjustment-service";
import type { CreateAdjustmentInput, AdjustmentFilters, Adjustment } from "@/lib/types/adjustment";

export async function getAdjustments(filters?: AdjustmentFilters): Promise<Adjustment[]> {
  return adjustmentService.getAdjustments(filters);
}

export async function getAdjustmentById(id: string): Promise<Adjustment | null> {
  return adjustmentService.getAdjustmentById(id);
}

export async function createAdjustment(data: CreateAdjustmentInput): Promise<Adjustment> {
  return adjustmentService.createAdjustment(data);
}

export async function deleteAdjustment(id: string, reason?: string): Promise<void> {
  return adjustmentService.deleteAdjustment(id, reason);
}
