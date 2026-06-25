import { connectDB } from "@/lib/db/connection";
import { Mail as MailModel } from "@/lib/db/models/mail";
import type { UpdateMailInput, Mail } from "@/lib/types/mail";
import { getAppName } from "./application-service";
import nodemailer from "nodemailer";

function toMail(d: Record<string, unknown>): Mail {
  return {
    id: (d._id as { toString(): string }).toString(),
    smtp_host: (d.smtp_host as string) ?? "",
    smtp_port: (d.smtp_port as number) ?? 587,
    smtp_secure: (d.smtp_secure as boolean) ?? false,
    smtp_user: (d.smtp_user as string) ?? "",
    smtp_pass: (d.smtp_pass as string) ?? "",
    smtp_from: (d.smtp_from as string) ?? "",
    sender_name: (d.sender_name as string) ?? "",
    created_at: d.created_at as Date,
    created_by: d.created_by ? (d.created_by as { toString(): string }).toString() : null,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by: d.updated_by ? (d.updated_by as { toString(): string }).toString() : null,
    deleted_at: (d.deleted_at as Date) ?? null,
  };
}

export async function getMailSettings(): Promise<Mail> {
  await connectDB();

  let mail = await MailModel.findOne().lean();

  if (!mail) {
    mail = await MailModel.create({
      smtp_host: "",
      smtp_port: 587,
      smtp_secure: false,
      smtp_user: "",
      smtp_pass: "",
      smtp_from: "",
      sender_name: "",
    });
    mail = mail.toObject();
  }

  return toMail(mail as unknown as Record<string, unknown>);
}

export async function updateMailSettings(data: UpdateMailInput): Promise<Mail> {
  await connectDB();

  const current = await MailModel.findOne().lean();
  if (!current) throw new Error("Mail settings not found");

  const updateData: Record<string, unknown> = {};
  if (data.smtp_host !== undefined) updateData.smtp_host = data.smtp_host;
  if (data.smtp_port !== undefined) updateData.smtp_port = data.smtp_port;
  if (data.smtp_secure !== undefined) updateData.smtp_secure = data.smtp_secure;
  if (data.smtp_user !== undefined) updateData.smtp_user = data.smtp_user;
  if (data.smtp_pass !== undefined) updateData.smtp_pass = data.smtp_pass;
  if (data.smtp_from !== undefined) updateData.smtp_from = data.smtp_from;
  if (data.sender_name !== undefined) updateData.sender_name = data.sender_name;
  updateData.updated_at = new Date();

  const updated = await MailModel.findByIdAndUpdate(
    current._id,
    { $set: updateData },
    { new: true }
  ).lean();

  if (!updated) throw new Error("Failed to update mail settings");

  return toMail(updated as unknown as Record<string, unknown>);
}

export async function sendTestEmail(recipientEmail: string): Promise<{ success: boolean; message: string }> {
  const settings = await getMailSettings();

  if (!settings.smtp_host) {
    return { success: false, message: "SMTP host is not configured" };
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_secure,
    auth: settings.smtp_user
      ? {
          user: settings.smtp_user,
          pass: settings.smtp_pass,
        }
      : undefined,
  });

  const appName = await getAppName();

  await transporter.sendMail({
    from: `"${settings.sender_name || appName}" <${settings.smtp_from}>`,
    to: recipientEmail,
    subject: `Test Email from ${appName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Test Email</h2>
          <p style="color: #475569; line-height: 1.6;">
            This is a test email sent from <strong>${appName}</strong>.
          </p>
          <p style="color: #475569; line-height: 1.6;">
            If you received this email, your SMTP settings are configured correctly.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Sent at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `,
  });

  return { success: true, message: "Test email sent successfully" };
}
