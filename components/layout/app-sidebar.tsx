"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Shield,
  Users,
  MapPin,
  FileText,
  Settings,
  ChevronRight,
  HardDrive,
  Laptop,
  BarChart3,
  TrendingDown,
  Package,
} from "lucide-react";
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

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Assets",
    url: "/assets",
    icon: Package,
    items: [
      { title: "Hardware Assets", url: "/assets?filter=hardware", icon: HardDrive },
      { title: "Software Assets", url: "/assets?filter=software", icon: Laptop },
      { title: "Licenses", url: "/assets?filter=licenses", icon: Shield },
    ],
  },
  {
    title: "Users & Assignments",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Locations",
    url: "/dashboard/locations",
    icon: MapPin,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
    items: [
      { title: "Asset Summary", url: "/dashboard/reports/summary", icon: FileText },
      { title: "Depreciation Report", url: "/dashboard/reports/depreciation", icon: TrendingDown },
    ],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="bg-[#1a1f36] border-r-0">
      <SidebarHeader className="pb-6 pt-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard">
                <div className="flex size-9 items-center justify-center bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/30">
                  <Server className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-white text-base">IT Asset Manager</span>
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
              {menuItems.map((item) => {
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
            <SidebarMenuButton size="sm" tooltip="Admin User" className="h-12 text-[#c5cee0] hover:bg-[#252d4a] hover:text-white transition-all duration-200">
              <div className="flex size-9 items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white text-xs font-bold shadow-lg shadow-[#3b82f6]/20">
                AU
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">Admin User</span>
                <span className="truncate text-xs text-[#6b7ba3]">
                  Administrator
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className="bg-[#252d4a] hover:bg-[#2d3757] border-r-0" />
    </Sidebar>
  );
}
