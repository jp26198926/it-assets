import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as userService from "@/lib/services/user-service";
import * as otpService from "@/lib/services/otp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp_code, new_password, confirm_password } = body;

    if (!email || typeof email !== "string") {
      return apiError("Email is required", 400);
    }
    if (!otp_code || typeof otp_code !== "string") {
      return apiError("OTP code is required", 400);
    }
    if (!new_password || typeof new_password !== "string") {
      return apiError("New password is required", 400);
    }
    if (new_password !== confirm_password) {
      return apiError("Passwords do not match", 400);
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return apiError("User not found", 404);
    }

    const otpResult = await otpService.verifyOtp(user.id, otp_code, "RESET_PASSWORD");
    if (!otpResult.success) {
      return apiError(otpResult.message, 400);
    }

    await userService.changePassword(user.id, new_password);

    return apiSuccess({ message: "Password reset successfully" });
  } catch {
    return apiError("Internal server error", 500);
  }
}