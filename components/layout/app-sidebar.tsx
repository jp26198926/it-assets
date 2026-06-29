"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Server, ChevronRight, User, LogOut, KeyRound, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSidebarPages } from "@/lib/actions/page-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import { logout } from "@/lib/actions/auth-actions";
import { getIcon } from "@/lib/icon-map";
import { useAuthorization } from "@/hooks/use-authorization";
import { UserChangePasswordModal } from "@/components/modals/user-change-password-modal";
import { ProfileModal } from "@/components/modals/profile-modal";
import { toast } from "sonner";
import type { Page } from "@/lib/types/page";
import type { AuthUser } from "@/lib/types/auth";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[];
}

function buildMenuTree(pages: Page[], hasPermission: (path: string, perm: string) => boolean): MenuItem[] {
  const parentMap = new Map<string, MenuItem>();
  const topLevel: MenuItem[] = [];

  for (const page of pages) {
    const icon = getIcon(page.icon);
    if (!page.parent_id) {
      const item: MenuItem = { title: page.name, url: page.path, icon };
      parentMap.set(page.id, item);
      topLevel.push(item);
    }
  }

  for (const page of pages) {
    if (page.parent_id) {
      const parent = parentMap.get(page.parent_id);
      if (parent) {
        if (hasPermission(page.path, "View")) {
          if (!parent.items) parent.items = [];
          parent.items.push({ title: page.name, url: page.path, icon: getIcon(page.icon) });
        }
      }
    }
  }

  return topLevel.filter((item) => {
    const hasView = hasPermission(item.url, "View");
    const hasChildView = item.items && item.items.length > 0;
    if (hasView) return true;
    if (hasChildView) return true;
    return false;
  });
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, hasPermission, isLoading } = useAuthorization();
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [appName, setAppName] = useState("IT Asset Manager");
  const [appLogo, setAppLogo] = useState<string | null>(null);

  useEffect(() => {
    getSidebarPages().then((pages) => {
      setAllPages(pages);
    });
    getAppSettings().then((settings) => {
      if (settings.app_name) setAppName(settings.app_name);
      if (settings.app_logo) setAppLogo(settings.app_logo);
    });
  }, []);

  useEffect(() => {
    if (authUser) setUser(authUser);
  }, [authUser]);

  const menuItems = useMemo(
    () => buildMenuTree(allPages, hasPermission),
    [allPages, hasPermission]
  );

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
    <Sidebar className="bg-[#1a1f36] border-r-0">
      <SidebarHeader className="pb-6 pt-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard">
                {appLogo ? (
                  <img src={appLogo} alt="Logo" className="size-9 rounded-lg object-contain" />
                ) : (
                  <div className="flex size-9 items-center justify-center bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/30">
                    <Server className="size-5" />
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-white text-base">{appName}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="bg-[#252d4a]" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7ba3] px-4 mb-1">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {!isLoading && menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.url ||
                  (item.items && item.items.some((sub) => pathname === sub.url));

                if (item.items) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isActive}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.title}
                            className={`h-11 transition-all duration-200 ${
                              isActive
                                ? "bg-[#3b82f6] text-white shadow-md shadow-[#3b82f6]/25"
                                : "text-[#c5cee0] hover:bg-[#252d4a] hover:text-white"
                            }`}
                          >
                            <Icon className="size-5 shrink-0" />
                            <span className="flex-1 font-medium">{item.title}</span>
                            <ChevronRight className={`ml-auto size-4 shrink-0 transition-transform duration-200 ${isActive ? "text-white/80" : "text-[#6b7ba3]"} group-data-[state=open]/collapsible:rotate-90`} />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="transition-all duration-200">
                          <SidebarMenuSub className="ml-4 border-l-2 border-[#252d4a] py-1 pl-3 gap-1">
                            {item.items.map((sub) => {
                              const SubIcon = sub.icon;
                              const isSubActive = pathname === sub.url;
                              return (
                                <SidebarMenuSubItem key={sub.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                    className={`h-9 transition-all duration-150 ${
                                      isSubActive
                                        ? "bg-[#252d4a] text-white"
                                        : "text-[#8892b0] hover:bg-[#252d4a]/50 hover:text-white"
                                    }`}
                                  >
                                    <Link href={sub.url}>
                                      <SubIcon className="size-4 shrink-0" />
                                      <span className="font-medium">{sub.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className={`h-11 transition-all duration-200 ${
                        pathname === item.url
                          ? "bg-[#3b82f6] text-white shadow-md shadow-[#3b82f6]/25"
                          : "text-[#c5cee0] hover:bg-[#252d4a] hover:text-white"
                      }`}
                    >
                      <Link href={item.url}>
                        <Icon className="size-5 shrink-0" />
                        <span className="flex-1 font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className="bg-[#252d4a]" />
      <SidebarFooter className="pb-4 px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="sm"
                  tooltip={user ? `${user.firstName} ${user.lastName}` : "User"}
                  className="h-12 text-[#c5cee0] hover:bg-[#252d4a] hover:text-white transition-all duration-200"
                >
                  <div className="flex size-9 items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white text-xs font-bold shadow-lg shadow-[#3b82f6]/20">
                    {user ? getInitials(user.firstName, user.lastName) : "..."}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">
                      {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                    </span>
                    <span className="truncate text-xs text-[#6b7ba3]">
                      {user?.role || ""}
                    </span>
                  </div>
                  <ChevronDown className="size-4 text-[#6b7ba3] ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className="bg-[#252d4a] hover:bg-[#2d3757] border-r-0" />

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
    </Sidebar>
  );
}