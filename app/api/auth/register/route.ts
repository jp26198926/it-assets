import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as authService from "@/lib/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, password, confirm_password } = body;

    if (!first_name || typeof first_name !== "string") {
      return apiError("First name is required", 400);
    }
    if (!last_name || typeof last_name !== "string") {
      return apiError("Last name is required", 400);
    }
    if (!email || typeof email !== "string") {
      return apiError("Email is required", 400);
    }
    if (!password || typeof password !== "string") {
      return apiError("Password is required", 400);
    }
    if (password !== confirm_password) {
      return apiError("Passwords do not match", 400);
    }

    const result = await authService.registerUser({
      first_name,
      last_name,
      email,
      password,
      confirm_password,
    });

    if (!result.success) {
      return apiError(result.error || "Registration failed", 400);
    }

    return apiSuccess({ message: result.message }, 201);
  } catch {
    return apiError("Internal server error", 500);
  }
}