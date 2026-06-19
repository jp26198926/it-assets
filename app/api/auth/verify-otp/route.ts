import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as otpService from "@/lib/services/otp-service";
import * as userService from "@/lib/services/user-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp_code, purpose } = body;

    if (!email || typeof email !== "string") {
      return apiError("Email is required", 400);
    }
    if (!otp_code || typeof otp_code !== "string") {
      return apiError("OTP code is required", 400);
    }
    if (!purpose || !["REGISTER", "RESET_PASSWORD"].includes(purpose)) {
      return apiError("Invalid purpose", 400);
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return apiError("User not found", 404);
    }

    const result = await otpService.verifyOtp(user.id, otp_code, purpose);

    if (!result.success) {
      return apiError(result.message, 400);
    }

    return apiSuccess({ message: result.message });
  } catch {
    return apiError("Internal server error", 500);
  }
}