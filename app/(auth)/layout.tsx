import type { Metadata } from "next";
import { AuthToaster } from "@/components/auth-toaster";

export const metadata: Metadata = {
  title: "IT Asset Management System",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
      <AuthToaster />
    </div>
  );
}