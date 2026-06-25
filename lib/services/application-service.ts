import { connectDB } from "@/lib/db/connection";
import { Application as ApplicationModel } from "@/lib/db/models/application";
import type { UpdateApplicationInput, Application } from "@/lib/types/application";

function toApplication(d: Record<string, unknown>): Application {
  return {
    id: (d._id as { toString(): string }).toString(),
    app_name: d.app_name as string,
    tagline: d.tagline as string,
    email: (d.email as string) ?? null,
    phone: (d.phone as string) ?? null,
    address: (d.address as string) ?? null,
    tin_number: (d.tin_number as string) ?? null,
    otp_expiry_duration: (d.otp_expiry_duration as number) ?? 5,
    android_download_link: (d.android_download_link as string) ?? null,
    ios_download_link: (d.ios_download_link as string) ?? null,
    facebook_link: (d.facebook_link as string) ?? null,
    x_link: (d.x_link as string) ?? null,
    instagram_link: (d.instagram_link as string) ?? null,
    created_at: d.created_at as Date,
    created_by: d.created_by ? (d.created_by as { toString(): string }).toString() : null,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by: d.updated_by ? (d.updated_by as { toString(): string }).toString() : null,
    deleted_at: (d.deleted_at as Date) ?? null,
  };
}

const DEFAULT_APP_NAME = "IT Asset Manager";

export async function getAppName(): Promise<string> {
  await connectDB();
  const app = await ApplicationModel.findOne().lean();
  return (app?.app_name as string) || DEFAULT_APP_NAME;
}

export async function getAppSettings(): Promise<Application> {
  await connectDB();

  let app = await ApplicationModel.findOne().lean();

  if (!app) {
    app = await ApplicationModel.create({
      app_name: "",
      tagline: "",
      otp_expiry_duration: 5,
    });
    app = app.toObject();
  }

  return toApplication(app as unknown as Record<string, unknown>);
}

export async function updateAppSettings(data: UpdateApplicationInput): Promise<Application> {
  await connectDB();

  const current = await ApplicationModel.findOne().lean();
  if (!current) throw new Error("Application settings not found");

  const updateData: Record<string, unknown> = {};
  if (data.app_name !== undefined) updateData.app_name = data.app_name;
  if (data.tagline !== undefined) updateData.tagline = data.tagline;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.address !== undefined) updateData.address = data.address || null;
  if (data.tin_number !== undefined) updateData.tin_number = data.tin_number || null;
  if (data.otp_expiry_duration !== undefined) updateData.otp_expiry_duration = data.otp_expiry_duration;
  if (data.android_download_link !== undefined) updateData.android_download_link = data.android_download_link || null;
  if (data.ios_download_link !== undefined) updateData.ios_download_link = data.ios_download_link || null;
  if (data.facebook_link !== undefined) updateData.facebook_link = data.facebook_link || null;
  if (data.x_link !== undefined) updateData.x_link = data.x_link || null;
  if (data.instagram_link !== undefined) updateData.instagram_link = data.instagram_link || null;
  updateData.updated_at = new Date();

  const updated = await ApplicationModel.findByIdAndUpdate(
    current._id,
    { $set: updateData },
    { new: true }
  ).lean();

  if (!updated) throw new Error("Failed to update application settings");

  return toApplication(updated as unknown as Record<string, unknown>);
}
