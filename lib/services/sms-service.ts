import { connectDB } from "@/lib/db/connection";
import { Sms as SmsModel } from "@/lib/db/models/sms";
import type { UpdateSmsInput, Sms } from "@/lib/types/sms";

function toSms(d: Record<string, unknown>): Sms {
  return {
    id: (d._id as { toString(): string }).toString(),
    api_key: (d.api_key as string) ?? "",
    device_id: (d.device_id as string) ?? "",
    created_at: d.created_at as Date,
    created_by: d.created_by ? (d.created_by as { toString(): string }).toString() : null,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by: d.updated_by ? (d.updated_by as { toString(): string }).toString() : null,
    deleted_at: (d.deleted_at as Date) ?? null,
  };
}

export async function getSmsSettings(): Promise<Sms> {
  await connectDB();

  let sms = await SmsModel.findOne().lean();

  if (!sms) {
    sms = await SmsModel.create({
      api_key: "",
      device_id: "",
    });
    sms = sms.toObject();
  }

  return toSms(sms as unknown as Record<string, unknown>);
}

export async function updateSmsSettings(data: UpdateSmsInput): Promise<Sms> {
  await connectDB();

  const current = await SmsModel.findOne().lean();
  if (!current) throw new Error("SMS settings not found");

  const updateData: Record<string, unknown> = {};
  if (data.api_key !== undefined) updateData.api_key = data.api_key;
  if (data.device_id !== undefined) updateData.device_id = data.device_id;
  updateData.updated_at = new Date();

  const updated = await SmsModel.findByIdAndUpdate(
    current._id,
    { $set: updateData },
    { new: true }
  ).lean();

  if (!updated) throw new Error("Failed to update SMS settings");

  return toSms(updated as unknown as Record<string, unknown>);
}

export async function sendTestSms(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  const settings = await getSmsSettings();

  if (!settings.api_key) {
    return { success: false, message: "API Key is not configured" };
  }

  if (!settings.device_id) {
    return { success: false, message: "Device ID is not configured" };
  }

  const response = await fetch(
    `https://api.textbee.dev/api/v1/gateway/devices/${settings.device_id}/send-sms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": settings.api_key,
      },
      body: JSON.stringify({
        recipients: [phoneNumber],
        message: "Test SMS from IT Asset Manager - Your SMS gateway is configured correctly.",
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    return {
      success: false,
      message: errorData?.message || `Failed to send SMS (HTTP ${response.status})`,
    };
  }

  return { success: true, message: "Test SMS sent successfully" };
}

export async function sendSms(phoneNumber: string, message: string): Promise<{ success: boolean; message: string }> {
  const settings = await getSmsSettings();

  if (!settings.api_key || !settings.device_id) {
    return { success: false, message: "SMS settings are not fully configured" };
  }

  const response = await fetch(
    `https://api.textbee.dev/api/v1/gateway/devices/${settings.device_id}/send-sms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": settings.api_key,
      },
      body: JSON.stringify({
        recipients: [phoneNumber],
        message,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    return {
      success: false,
      message: errorData?.message || `Failed to send SMS (HTTP ${response.status})`,
    };
  }

  return { success: true, message: "SMS sent successfully" };
}
