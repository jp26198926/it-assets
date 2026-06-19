"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Server, ChevronRight } from "lucide-react";
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
import { getSidebarPages } from "@/lib/actions/page-actions";
import { getIcon } from "@/lib/icon-map";
import type { Page } from "@/lib/types/page";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[];
}

function buildMenuTree(pages: Page[]): MenuItem[] {
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
        if (!parent.items) parent.items = [];
        parent.items.push({ title: page.name, url: page.path, icon: getIcon(page.icon) });
      }
    }
  }

  return topLevel;
}

export function AppSidebar() {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    getSidebarPages().then((pages) => {
      setMenuItems(buildMenuTree(pages));
    });
  }, []);

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
