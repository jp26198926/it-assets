"use server";

import { getTimezoneSelectOptions as getTimezoneOptions } from "@/lib/services/timezone-service";

export async function getTimezoneSelectOptions() {
  return getTimezoneOptions();
}
