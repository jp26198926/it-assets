import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { getAppSettings } from "@/lib/actions/application-actions";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();

  return {
    title: "IT Asset Management System",
    description: "Track and manage IT inventory across your organization",
    ...(settings.app_favicon
      ? {
          icons: {
            icon: [
              { url: settings.app_favicon, type: "image/png" },
            ],
          },
        }
      : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
