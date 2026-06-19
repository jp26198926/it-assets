"use server";

import * as smsService from "@/lib/services/sms-service";
import type { UpdateSmsInput, Sms } from "@/lib/types/sms";

export async function getSmsSettings(): Promise<Sms> {
  return smsService.getSmsSettings();
}

export async function updateSmsSettings(data: UpdateSmsInput): Promise<Sms> {
  return smsService.updateSmsSettings(data);
}

export async function sendTestSms(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  return smsService.sendTestSms(phoneNumber);
}
