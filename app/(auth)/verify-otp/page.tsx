"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { verifyOtp, resetPassword } from "@/lib/actions/auth-actions";
import { toast } from "sonner";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const purpose = (searchParams.get("purpose") as "REGISTER" | "RESET_PASSWORD") || "REGISTER";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canResend = countdown === 0;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  }, [otp]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      newErrors.otp = "Please enter the complete 6-digit code";
    }

    if (purpose === "RESET_PASSWORD") {
      if (!newPassword) newErrors.newPassword = "New password is required";
      else if (newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
      else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const otpCode = otp.join("");

      if (purpose === "REGISTER") {
        const result = await verifyOtp({ email, otp_code: otpCode, purpose });
        if (result.success) {
          toast.success("Email verified successfully! You can now login.");
          router.push("/login");
        } else {
          toast.error(result.error || "Verification failed");
        }
      } else {
        const result = await resetPassword({
          email,
          otp_code: otpCode,
          new_password: newPassword,
          confirm_password: confirmPassword,
        });
        if (result.success) {
          toast.success("Password reset successfully! You can now login.");
          router.push("/login");
        } else {
          toast.error(result.error || "Password reset failed");
        }
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const { requestForgotPassword } = await import("@/lib/actions/auth-actions");
      if (purpose === "REGISTER") {
        const { register } = await import("@/lib/actions/auth-actions");
        await register({
          first_name: "",
          last_name: "",
          email,
          password: "",
          confirm_password: "",
        });
      } else {
        await requestForgotPassword(email);
      }
      toast.success("New code sent to your email");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
    } catch {
      toast.error("Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-[#3b82f6] rounded-lg flex items-center justify-center mb-4">
          <span className="text-white font-bold text-xl">IT</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1a1f36]">
          {purpose === "REGISTER" ? "Verify Your Email" : "Reset Password"}
        </h1>
        <p className="text-sm text-[#64748b]">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-[#1a1f36]">{email}</span>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-12 text-center text-lg font-semibold ${
                    errors.otp ? "border-red-500" : ""
                  }`}
                />
              ))}
            </div>
            {errors.otp && (
              <p className="text-xs text-red-500 text-center">{errors.otp}</p>
            )}
          </div>

          {purpose === "RESET_PASSWORD" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={errors.newPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1a1f36]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-500">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1a1f36]"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : purpose === "REGISTER" ? (
              "Verify Email"
            ) : (
              "Reset Password"
            )}
          </Button>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm text-[#3b82f6] hover:underline disabled:text-[#64748b]"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            ) : (
              <p className="text-sm text-[#64748b]">
                Resend code in {countdown}s
              </p>
            )}
          </div>

          <Link
            href={purpose === "REGISTER" ? "/register" : "/forgot-password"}
            className="flex items-center justify-center gap-2 text-sm text-[#64748b] hover:text-[#1a1f36]"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}