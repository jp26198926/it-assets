import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as authService from "@/lib/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== "string") {
      return apiError("Email is required", 400);
    }
    if (!password || typeof password !== "string") {
      return apiError("Password is required", 400);
    }

    const result = await authService.authenticateUser(email, password);

    if (!result.success || !result.token || !result.user) {
      return apiError(result.error || "Authentication failed", 401);
    }

    const response = apiSuccess({ user: result.user });
    response.cookies.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return apiError("Internal server error", 500);
  }
}