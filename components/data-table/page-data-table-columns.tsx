"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import type { Page } from "@/lib/types/page";
import { DataTableColumnHeader } from "./data-table-column-header";
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
  Lock,
  Unlock,
  Key,
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
  User: Users,
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

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Deleted: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  page: Page;
  onView: (page: Page) => void;
  onEdit: (page: Page) => void;
  onDelete: (page: Page) => void;
  onRestore: (page: Page) => void;
}

function Actions({ page, onView, onEdit, onDelete, onRestore }: ActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(page)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(page)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Edit className="h-4 w-4 text-[#64748b]" />
          Edit Page
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!page.deleted_at ? (
          <DropdownMenuItem
            onClick={() => onDelete(page)}
            className="cursor-pointer gap-2 text-[#dc2626]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onRestore(page)}
            className="cursor-pointer gap-2 text-[#059669]"
          >
            <RotateCcw className="h-4 w-4" />
            Restore
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function createPageColumns(
  onView: (page: Page) => void,
  onEdit: (page: Page) => void,
  onDelete: (page: Page) => void,
  onRestore: (page: Page) => void
): ColumnDef<Page>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const page = row.original;
        const Icon = iconMap[page.icon] || Home;
        return (
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center bg-[#f0f4f8]">
              <Icon className="size-4 text-[#3b82f6]" />
            </div>
            <span className="font-medium text-[#1a1f36]">{row.getValue("name")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "path",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Path" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#64748b]">{row.getValue("path")}</span>
      ),
    },
    {
      accessorKey: "section",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Section" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("section") as string;
        return value ? (
          <span className="text-sm text-[#1a1f36]">{value}</span>
        ) : (
          <span className="text-sm text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "parent_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Parent" />
      ),
      cell: ({ row }) => {
        const value = row.original.parent_name;
        return value ? (
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center bg-[#e8f0fe] text-[#3b82f6] text-[10px] font-bold">
              {value.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <span className="text-sm font-medium text-[#1a1f36]">{value}</span>
          </div>
        ) : (
          <span className="text-sm text-[#94a3b8] italic">Root</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const config = statusConfig[status] || statusConfig.Active;
        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${config.color}`}>
            <span className={`size-1.5 ${config.dot}`} />
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as Date;
        return (
          <span className="text-sm tabular-nums text-[#1a1f36]">
            {format(new Date(date), "MMM dd, yyyy")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Actions
          page={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ),
    },
  ];
}
