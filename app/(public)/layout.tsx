import type { Metadata } from "next";
import { AuthToaster } from "@/components/auth-toaster";

export const metadata: Metadata = {
  title: "IT Support Portal",
};

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
