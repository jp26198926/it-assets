import { cookies } from "next/headers";
import * as jwtService from "./jwt-service";
import * as authorizationService from "./authorization-service";
import type { AuthUser, JwtPayload } from "@/lib/types/auth";

export interface AuthResult {
  authorized: boolean;
  user?: AuthUser;
  error?: string;
}

export async function getAuthFromRequest(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  const payload: JwtPayload | null = await jwtService.verifyToken(token);
  if (!payload) return null;

  if (payload.userId === "fallback") {
    return {
      userId: "fallback",
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      roleId: payload.roleId || "",
      phone: null,
      avatar_url: null,
    };
  }

  return {
    userId: payload.userId,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
    roleId: payload.roleId,
    phone: payload.phone ?? null,
    avatar_url: null,
  };
}

export async function requirePermission(
  pagePath: string,
  permission: string
): Promise<AuthResult> {
  const user = await getAuthFromRequest();

  if (!user) {
    return { authorized: false, error: "Not authenticated" };
  }

  if (user.userId === "fallback") {
    return { authorized: true, user };
  }

  if (!user.roleId) {
    return { authorized: false, error: "No role assigned" };
  }

  const permitted = await authorizationService.hasPermission(
    user.roleId,
    pagePath,
    permission
  );

  if (!permitted) {
    return { authorized: false, error: "Insufficient permissions" };
  }

  return { authorized: true, user };
}
