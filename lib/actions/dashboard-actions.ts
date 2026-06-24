"use server";

import { getDashboardStats } from "@/lib/services/dashboard-service";
import type { DashboardStats } from "@/lib/types/dashboard";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return getDashboardStats();
}
