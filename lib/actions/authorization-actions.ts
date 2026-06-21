"use server";

import * as authorizationService from "@/lib/services/authorization-service";
import { getAuthFromRequest } from "@/lib/services/api-auth";

export async function getCurrentUserPermissions(): Promise<
  Record<string, string[]>
> {
  const user = await getAuthFromRequest();
  if (!user) return {};
  if (user.userId === "fallback") return {};

  return authorizationService.getUserPagePermissions(user.roleId);
}

export async function checkPermission(
  pagePath: string,
  permission: string
): Promise<boolean> {
  const user = await getAuthFromRequest();
  if (!user) return false;
  if (user.userId === "fallback") return true;

  return authorizationService.hasPermission(user.roleId, pagePath, permission);
}
