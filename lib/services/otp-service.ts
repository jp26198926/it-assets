import { connectDB } from "@/lib/db/connection";
import { UserOtpLog as OtpLogModel } from "@/lib/db/models/user-otp-log";
import { Application as AppModel } from "@/lib/db/models/application";
import { User as UserModel } from "@/lib/db/models/user";
import { getMailSettings } from "./mail-service";
import { getAppName } from "./application-service";
import { sendSms } from "./sms-service";
import nodemailer from "nodemailer";
import { Types } from "mongoose";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getOtpExpiryMinutes(): Promise<number> {
  await connectDB();
  const app = await AppModel.findOne().lean();
  return (app?.otp_expiry_duration) ?? 5;
}

export async function sendOtp(
  userId: Types.ObjectId,
  purpose: "REGISTER" | "LOGIN" | "RESET_PASSWORD" | "EMAIL_CHANGE" | "PHONE_CHANGE",
  recipientEmail?: string,
  recipientPhone?: string
): Promise<{ success: boolean; message: string; otpCode?: string }> {
  await connectDB();

  const otpCode = generateOtp();
  const expiryMinutes = await getOtpExpiryMinutes();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await OtpLogModel.updateMany(
    { user_id: userId, purpose, status: "ACTIVE" },
    { $set: { status: "EXPIRED" } }
  );

  await OtpLogModel.create({
    user_id: userId,
    otp_code: otpCode,
    purpose,
    sent_at: new Date(),
    expires_at: expiresAt,
    status: "ACTIVE",
    attempt_count: 0,
  });

  if (purpose === "PHONE_CHANGE" && recipientPhone) {
    const appName = await getAppName();
    const smsMessage = `[${appName}] Your verification code is: ${otpCode}. It expires in ${expiryMinutes} minutes. Do not share this code with anyone.`;

    const smsResult = await sendSms(recipientPhone, smsMessage);

    if (!smsResult.success) {
      console.log(`[OTP] Purpose: ${purpose}, Code: ${otpCode}, Phone: ${recipientPhone}, Expires: ${expiresAt}`);
      return { success: true, message: "OTP sent (check console - SMS not configured)", otpCode };
    }

    return { success: true, message: "OTP sent to your phone" };
  }

  const settings = await getMailSettings();

  if (!settings.smtp_host) {
    console.log(`[OTP] Purpose: ${purpose}, Code: ${otpCode}, Expires: ${expiresAt}`);
    return { success: true, message: "OTP sent (check console - SMTP not configured)", otpCode };
  }

  const user = await UserModel.findById(userId).lean();
  if (!user) return { success: false, message: "User not found" };

  const appName = await getAppName();
  let subject: string;
  let htmlContent: string;

  if (purpose === "REGISTER") {
    subject = `Verify Your Email - ${appName}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #475569; line-height: 1.6;">
            Hi ${user.first_name}, thank you for registering. Please use the following OTP code to verify your email and activate your account:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; background: #f0f4f8; padding: 15px 30px; border-radius: 4px;">${otpCode}</span>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            This code will expire in <strong>${expiryMinutes} minutes</strong>.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
    `;
  } else if (purpose === "EMAIL_CHANGE") {
    subject = `Verify Your New Email - ${appName}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Verify Your New Email</h2>
          <p style="color: #475569; line-height: 1.6;">
            Hi ${user.first_name}, you requested to change your email address. Please use the following OTP code to verify your new email:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; background: #f0f4f8; padding: 15px 30px; border-radius: 4px;">${otpCode}</span>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            This code will expire in <strong>${expiryMinutes} minutes</strong>.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
    `;
  } else {
    subject = `Reset Your Password - ${appName}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #475569; line-height: 1.6;">
            Hi ${user.first_name}, we received a request to reset your password. Please use the following OTP code:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; background: #f0f4f8; padding: 15px 30px; border-radius: 4px;">${otpCode}</span>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            This code will expire in <strong>${expiryMinutes} minutes</strong>.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
    `;
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_secure,
    auth: settings.smtp_user
      ? { user: settings.smtp_user, pass: settings.smtp_pass }
      : undefined,
  });

  const emailRecipient = recipientEmail || user.email;
  await transporter.sendMail({
    from: `"${settings.sender_name || appName}" <${settings.smtp_from}>`,
    to: emailRecipient,
    subject,
    html: htmlContent,
  });

  return { success: true, message: "OTP sent to your email" };
}

export async function verifyOtp(
  userId: string,
  otpCode: string,
  purpose: "REGISTER" | "RESET_PASSWORD" | "EMAIL_CHANGE" | "PHONE_CHANGE"
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  const otpLog = await OtpLogModel.findOne({
    user_id: userId,
    purpose,
    status: "ACTIVE",
  }).sort({ sent_at: -1 }).lean();

  if (!otpLog) {
    return { success: false, message: "No active OTP found. Please request a new one." };
  }

  if (new Date() > otpLog.expires_at) {
    await OtpLogModel.findByIdAndUpdate(otpLog._id, { status: "EXPIRED" });
    return { success: false, message: "OTP has expired. Please request a new one." };
  }

  if (otpLog.attempt_count >= 5) {
    await OtpLogModel.findByIdAndUpdate(otpLog._id, { status: "EXPIRED" });
    return { success: false, message: "Maximum attempts exceeded. Please request a new OTP." };
  }

  await OtpLogModel.findByIdAndUpdate(otpLog._id, {
    $inc: { attempt_count: 1 },
  });

  if (otpCode !== otpLog.otp_code) {
    return { success: false, message: "Invalid OTP code." };
  }

  await OtpLogModel.findByIdAndUpdate(otpLog._id, {
    status: "USED",
    verified_at: new Date(),
  });

  if (purpose === "REGISTER") {
    await UserModel.findByIdAndUpdate(userId, {
      status: "Active",
      is_verified: true,
      email_verified_at: new Date(),
      updated_at: new Date(),
    });
  }

  return { success: true, message: "OTP verified successfully" };
}