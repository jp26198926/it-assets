"use server";

import * as releasingService from "@/lib/services/releasing-service";
import type { CreateReleasingInput, UpdateReleasingInput, ReleasingFilters, Releasing } from "@/lib/types/releasing";

export async function getReleasings(filters?: ReleasingFilters): Promise<Releasing[]> {
  return releasingService.getReleasings(filters);
}

export async function getReleasingById(id: string): Promise<Releasing | null> {
  return releasingService.getReleasingById(id);
}

export async function createReleasing(data: CreateReleasingInput): Promise<Releasing> {
  return releasingService.createReleasing(data);
}

export async function updateReleasing(id: string, data: UpdateReleasingInput): Promise<Releasing> {
  return releasingService.updateReleasing(id, data);
}

export async function cancelReleasing(id: string): Promise<void> {
  return releasingService.cancelReleasing(id);
}

export async function completeReleasing(id: string): Promise<void> {
  return releasingService.completeReleasing(id);
}

export async function deleteReleasing(id: string, reason?: string): Promise<void> {
  return releasingService.deleteReleasing(id, reason);
}
