"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { Search, Bell, MessageSquare, User, LogOut, KeyRound, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser, logout } from "@/lib/actions/auth-actions";
import { UserChangePasswordModal } from "@/components/modals/user-change-password-modal";
import { ProfileModal } from "@/components/modals/profile-modal";
import { toast } from "sonner";
import type { AuthUser } from "@/lib/types/auth";
import { useBreadcrumbOverrides } from "@/components/layout/breadcrumb-override-context";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { overrides } = useBreadcrumbOverrides();

  const fetchUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const breadcrumbItems = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const defaultLabel = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const label = overrides[segment] || defaultLabel;
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleChangePassword = async (password: string) => {
    const { changeMyPassword } = await import("@/lib/actions/auth-actions");
    const result = await changeMyPassword("", password);
    if (result.success) {
      toast.success("Password changed successfully");
    } else {
      toast.error(result.error || "Failed to change password");
      throw new Error(result.error);
    }
  };

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
              <React.Fragment key={item.href}>
                <BreadcrumbSeparator className="text-[#cbd5e1]" />
                <BreadcrumbItem>
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
              </React.Fragment>
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2 py-1.5 hover:bg-[#f0f4f8] transition-colors rounded-md">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#1a1f36]">
                  {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                </p>
                <p className="text-xs text-[#64748b]">{user?.role || ""}</p>
              </div>
              <div className="flex size-8 sm:size-9 items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-[#3b82f6]/20 overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="size-full object-cover" />
                ) : user ? (
                  getInitials(user.firstName, user.lastName)
                ) : (
                  "..."
                )}
              </div>
              <ChevronDown className="size-4 text-[#64748b] hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
              <User className="size-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setChangePasswordOpen(true)} className="cursor-pointer">
              <KeyRound className="size-4 mr-2" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="size-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <UserChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        userName={user ? `${user.firstName} ${user.lastName}` : ""}
        onSubmit={handleChangePassword}
      />

      <ProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        user={user}
        onUserUpdate={setUser}
      />
    </header>
  );
}