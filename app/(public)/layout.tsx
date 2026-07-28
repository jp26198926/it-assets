import type { Metadata } from "next";
import { AuthToaster } from "@/components/auth-toaster";
import { getAppSettings } from "@/lib/actions/application-actions";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  return { title: settings.app_name || "IT Asset Manager" };
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {children}
      <AuthToaster />
    </div>
  );
}
