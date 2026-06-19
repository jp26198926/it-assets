import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as authService from "@/lib/services/auth-service";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const user = await authService.getCurrentUser(token);
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    return apiSuccess({ user });
  } catch {
    return apiError("Internal server error", 500);
  }
}