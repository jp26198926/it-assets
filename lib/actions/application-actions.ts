"use server";

import * as applicationService from "@/lib/services/application-service";
import type { UpdateApplicationInput, Application } from "@/lib/types/application";

export async function getAppSettings(): Promise<Application> {
  return applicationService.getAppSettings();
}

export async function updateAppSettings(data: UpdateApplicationInput): Promise<Application> {
  return applicationService.updateAppSettings(data);
}
