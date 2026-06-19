"use server";

import * as mailService from "@/lib/services/mail-service";
import type { UpdateMailInput, Mail } from "@/lib/types/mail";

export async function getMailSettings(): Promise<Mail> {
  return mailService.getMailSettings();
}

export async function updateMailSettings(data: UpdateMailInput): Promise<Mail> {
  return mailService.updateMailSettings(data);
}

export async function sendTestEmail(recipientEmail: string): Promise<{ success: boolean; message: string }> {
  return mailService.sendTestEmail(recipientEmail);
}
