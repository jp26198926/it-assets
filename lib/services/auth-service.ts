import { connectDB } from "@/lib/db/connection";
import { User as UserModel } from "@/lib/db/models/user";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import * as jwtService from "./jwt-service";
import * as otpService from "./otp-service";
import * as userService from "./user-service";
import type { JwtPayload, RegisterInput, AuthUser } from "@/lib/types/auth";

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; user?: AuthUser; error?: string }> {
  await connectDB();

  const userCount = await UserModel.countDocuments({ deleted_at: null });

  if (userCount === 0) {
    if (email === process.env.USERNAME && password === process.env.PASSWORD) {
    const payload: JwtPayload = {
      userId: "fallback",
      email: process.env.USERNAME!,
      firstName: "Admin",
      lastName: "System",
      role: "Admin",
      roleId: "",
      phone: null,
    };
      const token = await jwtService.signToken(payload);
      return { success: true, token, user: payload as AuthUser };
    }
    return { success: false, error: "Invalid credentials" };
  }

  const user = await UserModel.findOne({ email })
    .populate("role_id", "name")
    .lean();

  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  if (user.status !== "Active") {
    return { success: false, error: "Your account is not active. Please verify your email first." };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return { success: false, error: "Invalid email or password" };
  }

  const role = user.role_id as unknown as { _id: { toString(): string }; name: string };
  const payload: JwtPayload = {
    userId: (user._id as { toString(): string }).toString(),
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: role.name,
    roleId: role._id.toString(),
    phone: (user.phone as string) ?? null,
  };

  const token = await jwtService.signToken(payload);
  return { success: true, token, user: payload as AuthUser };
}

export async function registerUser(
  data: RegisterInput
): Promise<{ success: boolean; message?: string; error?: string; userId?: string }> {
  const existingUser = await userService.getUserByEmail(data.email);
  if (existingUser) {
    return { success: false, error: "An account with this email already exists" };
  }

  const user = await userService.createInactiveUser({
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password: data.password,
    role_id: "",
  });

  await otpService.sendOtp(new Types.ObjectId(user.id), "REGISTER");

  return {
    success: true,
    message: "Registration successful. Please check your email for the verification code.",
    userId: user.id,
  };
}

export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return { success: true, message: "If an account exists with this email, you will receive a password reset code." };
  }

  await otpService.sendOtp(new Types.ObjectId(user.id), "RESET_PASSWORD");

  return { success: true, message: "If an account exists with this email, you will receive a password reset code." };
}

export async function getCurrentUser(
  token: string
): Promise<AuthUser | null> {
  const payload = await jwtService.verifyToken(token);
  if (!payload) return null;

  if (payload.userId === "fallback") {
    return {
      userId: "fallback",
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      roleId: "",
      phone: null,
      avatar_url: null,
    };
  }

  const user = await userService.getUserById(payload.userId);
  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role_name || "Viewer",
    roleId: user.role_id,
    phone: user.phone ?? null,
    avatar_url: user.avatar_url ?? null,
  };
}