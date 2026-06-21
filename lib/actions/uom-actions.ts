"use server";

import * as uomService from "@/lib/services/uom-service";
import type { CreateUOMInput, UpdateUOMInput, UOMFilters, UOM } from "@/lib/types/uom";

export async function getUOMs(filters?: UOMFilters): Promise<UOM[]> {
  return uomService.getUOMs(filters);
}

export async function getUOMById(id: string): Promise<UOM | null> {
  return uomService.getUOMById(id);
}

export async function createUOM(data: CreateUOMInput): Promise<UOM> {
  return uomService.createUOM(data);
}

export async function updateUOM(id: string, data: UpdateUOMInput): Promise<UOM> {
  return uomService.updateUOM(id, data);
}

export async function deleteUOM(id: string, reason?: string): Promise<void> {
  return uomService.deleteUOM(id, reason);
}

export async function restoreUOM(id: string): Promise<void> {
  return uomService.restoreUOM(id);
}
