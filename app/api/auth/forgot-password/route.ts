import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as authService from "@/lib/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return apiError("Email is required", 400);
    }

    const result = await authService.requestPasswordReset(email);
    return apiSuccess({ message: result.message });
  } catch {
    return apiError("Internal server error", 500);
  }
}