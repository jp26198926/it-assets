export interface JwtPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface VerifyOtpInput {
  email: string;
  otp_code: string;
  purpose: "REGISTER" | "RESET_PASSWORD";
}

export interface ResetPasswordInput {
  email: string;
  otp_code: string;
  new_password: string;
  confirm_password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
}
