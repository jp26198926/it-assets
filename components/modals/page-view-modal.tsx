"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/types/page";
import {
  Home,
  Settings,
  FileText,
  Users,
  Shield,
  Server,
  Database,
  LayoutDashboard,
  BarChart3,
  Package,
  MapPin,
  Bell,
  Mail,
  Calendar,
  Clock,
  Search,
  Folder,
  FolderOpen,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Key,
  User,
  UserPlus,
  Building,
  Briefcase,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Wifi,
  Printer,
  Monitor,
  Laptop,
  HardDrive,
  type LucideIcon,
} from "lucide-react";

interface PageViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: Page | null;
}

const iconMap: Record<string, LucideIcon> = {
  Home,
  Settings,
  FileText,
  Users,
  Shield,
  Server,
  Database,
  LayoutDashboard,
  BarChart3,
  Package,
  MapPin,
  Bell,
  Mail,
  Calendar,
  Clock,
  Search,
  Folder,
  FolderOpen,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Key,
  User,
  UserPlus,
  Building,
  Briefcase,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Wifi,
  Printer,
  Monitor,
  Laptop,
  HardDrive,
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export function PageViewModal({
  open,
  onOpenChange,
  page,
}: PageViewModalProps) {
  if (!page) return null;

  const Icon = iconMap[page.icon] || Home;
  const config = statusConfig[page.status || "Active"] || statusConfig.Active;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center bg-[#f0f4f8]">
              <Icon className="size-5 text-[#3b82f6]" />
            </div>
            <div>
              <div>{page.name}</div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
                <span className={`size-1.5 rounded-full ${config.dot}`} />
                {page.status}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {page.path}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</p>
                <p className="text-sm mt-1">{page.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Path</p>
                <p className="text-sm font-mono mt-1">{page.path}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Icon</p>
                <div className="flex items-center gap-2 mt-1">
                  <Icon className="size-4 text-[#3b82f6]" />
                  <p className="text-sm">{page.icon}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Section</p>
                <p className="text-sm mt-1">{page.section || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order</p>
                <p className="text-sm mt-1">{page.order ?? 0}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Parent Page</p>
                <p className="text-sm mt-1">{page.parent_name || "None (Root Level)"}</p>
              </div>
            </div>
          </div>

          <div className="py-3"><hr /></div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created At</p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(page.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</p>
                <p className="text-sm mt-1">{page.created_by_name || "N/A"}</p>
              </div>
              {page.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted At</p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {format(new Date(page.deleted_at), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  {page.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delete Reason</p>
                      <p className="text-sm mt-1 text-rose-600">{page.deleted_reason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
                <p className="text-sm mt-1 tabular-nums">
                  {page.updated_at
                    ? format(new Date(page.updated_at), "MMMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated By</p>
                <p className="text-sm mt-1">{page.updated_by_name || "N/A"}</p>
              </div>
              {page.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted By</p>
                  <p className="text-sm mt-1 text-rose-600">{page.deleted_by_name || "N/A"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {page.description && (
          <div className="bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
            <p className="text-sm mt-2">{page.description}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
