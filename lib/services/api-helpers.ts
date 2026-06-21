import { NextResponse } from "next/server";
import { requirePermission, type AuthResult } from "./api-auth";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function withPageAuth(
  pagePath: string,
  permission: string
): Promise<{ auth: AuthResult; error?: NextResponse }> {
  const auth = await requirePermission(pagePath, permission);
  if (!auth.authorized) {
    return {
      auth,
      error: apiError(auth.error || "Unauthorized", auth.error === "Not authenticated" ? 401 : 403),
    };
  }
  return { auth };
}
