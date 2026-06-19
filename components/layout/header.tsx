"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Search, Bell, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 sm:gap-4 border-b border-[#e2e8f0] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="-ml-1 text-[#64748b] hover:text-[#1a1f36] hover:bg-[#f0f4f8] transition-colors" />
        <div className="hidden sm:block h-6 w-px bg-[#e2e8f0]" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="text-[#64748b] transition-colors hover:text-[#1a1f36]"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.map((item) => (
              <BreadcrumbItem key={item.href}>
                <BreadcrumbSeparator className="text-[#cbd5e1]" />
                {item.isLast ? (
                  <BreadcrumbPage className="font-semibold text-[#1a1f36]">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.href}
                    className="text-[#64748b] transition-colors hover:text-[#1a1f36]"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            placeholder="Type to search..."
            className="h-10 w-64 bg-[#f0f4f8] pl-10 text-sm border-0 focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-0"
          />
        </div>

        <button className="relative flex size-9 sm:size-10 items-center justify-center text-[#64748b] hover:bg-[#f0f4f8] hover:text-[#1a1f36] transition-colors">
          <Bell className="size-5" />
          <span className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 size-2 bg-[#ef4444] ring-2 ring-white" />
        </button>

        <button className="relative flex size-9 sm:size-10 items-center justify-center text-[#64748b] hover:bg-[#f0f4f8] hover:text-[#1a1f36] transition-colors">
          <MessageSquare className="size-5" />
          <span className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 size-2 bg-[#3b82f6] ring-2 ring-white" />
        </button>

        <div className="hidden sm:block h-8 w-px bg-[#e2e8f0] mx-1" />

        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer px-1 sm:px-2 py-1.5 hover:bg-[#f0f4f8] transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#1a1f36]">Thomas Anree</p>
            <p className="text-xs text-[#64748b]">UX Designer</p>
          </div>
          <div className="flex size-8 sm:size-9 items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-[#3b82f6]/20">
            TA
          </div>
        </div>
      </div>
    </header>
  );
}
