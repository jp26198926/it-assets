"use server";

import * as locationService from "@/lib/services/location-service";
import type { CreateLocationInput, UpdateLocationInput, LocationFilters, Location } from "@/lib/types/location";

export async function getLocations(filters?: LocationFilters): Promise<Location[]> {
  return locationService.getLocations(filters);
}

export async function getLocationById(id: string): Promise<Location | null> {
  return locationService.getLocationById(id);
}

export async function createLocation(data: CreateLocationInput): Promise<Location> {
  return locationService.createLocation(data);
}

export async function updateLocation(id: string, data: UpdateLocationInput): Promise<Location> {
  return locationService.updateLocation(id, data);
}

export async function deleteLocation(id: string, reason?: string): Promise<void> {
  return locationService.deleteLocation(id, reason);
}

export async function restoreLocation(id: string): Promise<void> {
  return locationService.restoreLocation(id);
}
