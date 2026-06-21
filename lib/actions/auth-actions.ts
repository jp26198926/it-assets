"use server";

import { cookies } from "next/headers";
import * as authService from "@/lib/services/auth-service";
import * as otpService from "@/lib/services/otp-service";
import * as userService from "@/lib/services/user-service";
import type { LoginInput, RegisterInput, VerifyOtpInput, ResetPasswordInput, AuthUser } from "@/lib/types/auth";
import type { ProfileUpdateInput } from "@/lib/types/user";
import { Types } from "mongoose";

export async function login(data: LoginInput): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  const result = await authService.authenticateUser(data.email, data.password);

  if (result.success && result.token && result.user) {
    const cookieStore = await cookies();
    cookieStore.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return { success: true, user: result.user };
  }

  return { success: false, error: result.error };
}

export async function register(data: RegisterInput): Promise<{ success: boolean; message?: string; error?: string }> {
  const result = await authService.registerUser(data);
  return result;
}

export async function verifyOtp(data: VerifyOtpInput): Promise<{ success: boolean; message?: string; error?: string }> {
  const user = await userService.getUserByEmail(data.email);
  if (!user) {
    return { success: false, error: "User not found" };
  }

  const result = await otpService.verifyOtp(user.id, data.otp_code, data.purpose);
  return result;
}

export async function requestForgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const result = await authService.requestPasswordReset(email);
  return result;
}

export async function resetPassword(data: ResetPasswordInput): Promise<{ success: boolean; message?: string; error?: string }> {
  const user = await userService.getUserByEmail(data.email);
  if (!user) {
    return { success: false, error: "User not found" };
  }

  const otpResult = await otpService.verifyOtp(user.id, data.otp_code, "RESET_PASSWORD");
  if (!otpResult.success) {
    return { success: false, error: otpResult.message };
  }

  await userService.changePassword(user.id, data.new_password);

  return { success: true, message: "Password reset successfully. You can now login." };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  return authService.getCurrentUser(token);
}

export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  if (user.userId === "fallback") {
    return { success: false, error: "Cannot change password for fallback admin" };
  }

  const fullUser = await userService.getUserByEmail(user.email);
  if (!fullUser) {
    return { success: false, error: "User not found" };
  }

  const bcrypt = await import("bcryptjs");
  const userDoc = await import("@/lib/db/models/user").then(m => m.User.findById(fullUser.id).lean());
  if (!userDoc) {
    return { success: false, error: "User not found" };
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, userDoc.password_hash);
  if (!isPasswordValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  await userService.changePassword(fullUser.id, newPassword);
  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export async function updateMyProfile(data: ProfileUpdateInput): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Not authenticated" };
  }

  if (currentUser.userId === "fallback") {
    return { success: false, error: "Cannot update profile for fallback admin" };
  }

  const fullUser = await userService.getUserByEmail(currentUser.email);
  if (!fullUser) {
    return { success: false, error: "User not found" };
  }

  if ((data.email && data.email_otp) || (data.phone && data.phone_otp)) {
    const emailOtpResult = data.email && data.email_otp
      ? await otpService.verifyOtp(fullUser.id, data.email_otp, "EMAIL_CHANGE")
      : null;
    const phoneOtpResult = data.phone && data.phone_otp
      ? await otpService.verifyOtp(fullUser.id, data.phone_otp, "PHONE_CHANGE")
      : null;

    if (emailOtpResult && !emailOtpResult.success) {
      return { success: false, error: emailOtpResult.message };
    }
    if (phoneOtpResult && !phoneOtpResult.success) {
      return { success: false, error: phoneOtpResult.message };
    }

    if (emailOtpResult && data.email) {
      await userService.updateUserEmail(fullUser.id, data.email);
    }
    if (phoneOtpResult && data.phone) {
      await userService.updateUserPhone(fullUser.id, data.phone);
    }
  }

  const updatedUser = await userService.updateProfile(fullUser.id, data);

  return {
    success: true,
    user: {
      userId: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role_name || "Viewer",
      roleId: updatedUser.role_id,
      phone: updatedUser.phone ?? null,
      avatar_url: updatedUser.avatar_url ?? null,
    },
  };
}

export async function requestEmailChange(newEmail: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Not authenticated" };
  }

  if (currentUser.userId === "fallback") {
    return { success: false, error: "Cannot change email for fallback admin" };
  }

  const fullUser = await userService.getUserByEmail(currentUser.email);
  if (!fullUser) {
    return { success: false, error: "User not found" };
  }

  const existingUser = await userService.getUserByEmail(newEmail);
  if (existingUser) {
    return { success: false, error: "Email already in use" };
  }

  const otpResult = await otpService.sendOtp(
    new Types.ObjectId(fullUser.id),
    "EMAIL_CHANGE",
    newEmail
  );

  return { success: true, message: "Verification code sent to your new email" };
}

export async function verifyEmailChange(otpCode: string, newEmail: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Not authenticated" };
  }

  if (currentUser.userId === "fallback") {
    return { success: false, error: "Cannot change email for fallback admin" };
  }

  const fullUser = await userService.getUserByEmail(currentUser.email);
  if (!fullUser) {
    return { success: false, error: "User not found" };
  }

  const otpResult = await otpService.verifyOtp(fullUser.id, otpCode, "EMAIL_CHANGE");
  if (!otpResult.success) {
    return { success: false, error: otpResult.message };
  }

  await userService.updateUserEmail(fullUser.id, newEmail);

  return { success: true, message: "Email updated successfully" };
}

export async function uploadProfilePhoto(fileBase64: string, fileName: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const { v2: cloudinary } = await import("cloudinary");
  const cloudinaryService = await import("@/lib/services/cloudinary-service");
  const settings = await cloudinaryService.getCloudinarySettings();

  if (!settings.cloud_name || !settings.api_key || !settings.api_secret) {
    return { success: false, error: "Cloudinary credentials are not configured" };
  }

  cloudinary.config({
    cloud_name: settings.cloud_name,
    api_key: settings.api_key,
    api_secret: settings.api_secret,
  });

  try {
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: "it-assets/avatars",
      public_id: `avatar_${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}`,
    });

    return { success: true, url: result.secure_url };
  } catch {
    return { success: false, error: "Failed to upload photo" };
  }
}

export async function requestPhoneChange(newPhone: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Not authenticated" };
  }

  if (currentUser.userId === "fallback") {
    return { success: false, error: "Cannot change phone for fallback admin" };
  }

  const fullUser = await userService.getUserByEmail(currentUser.email);
  if (!fullUser) {
    return { success: false, error: "User not found" };
  }

  const otpResult = await otpService.sendOtp(
    new Types.ObjectId(fullUser.id),
    "PHONE_CHANGE",
    undefined,
    newPhone
  );

  return { success: true, message: "Verification code sent to your phone" };
}

export async function verifyPhoneChange(otpCode: string, newPhone: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Not authenticated" };
  }

  if (currentUser.userId === "fallback") {
    return { success: false, error: "Cannot change phone for fallback admin" };
  }

  const fullUser = await userService.getUserByEmail(currentUser.email);
  if (!fullUser) {
    return { success: false, error: "User not found" };
  }

  const otpResult = await otpService.verifyOtp(fullUser.id, otpCode, "PHONE_CHANGE");
  if (!otpResult.success) {
    return { success: false, error: otpResult.message };
  }

  await userService.updateUserPhone(fullUser.id, newPhone);

  return { success: true, message: "Phone number updated successfully" };
}