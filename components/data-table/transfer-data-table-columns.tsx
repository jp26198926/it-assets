"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { formatInAppTimezone } from "@/lib/utils/timezone";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Ban } from "lucide-react";
import { useAuthorization } from "@/hooks/use-authorization";
import type { Transfer } from "@/lib/types/transfer";
import { DataTableColumnHeader } from "./data-table-column-header";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Completed: { color: "bg-[#dbeafe] text-[#2563eb]", dot: "bg-[#2563eb]" },
  Cancelled: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  transfer: Transfer;
  onView: (transfer: Transfer) => void;
  onEdit: (transfer: Transfer) => void;
  onCancel: (transfer: Transfer) => void;
}

function Actions({ transfer, onView, onEdit, onCancel }: ActionsProps) {
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/transfers", "Edit");
  const canDelete = hasPermission("/transfers", "Delete");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(transfer)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View
        </DropdownMenuItem>
        {canEdit && transfer.status === "Active" && (
          <DropdownMenuItem onClick={() => onEdit(transfer)} className="cursor-pointer gap-2 text-[#1a1f36]">
            <Edit className="h-4 w-4 text-[#64748b]" />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {canDelete && transfer.status === "Active" && (
          <DropdownMenuItem
            onClick={() => onCancel(transfer)}
            className="cursor-pointer gap-2 text-[#dc2626]"
          >
            <Ban className="h-4 w-4" />
            Cancel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function createTransferColumns(
  onView: (transfer: Transfer) => void,
  onEdit: (transfer: Transfer) => void,
  onCancel: (transfer: Transfer) => void,
  timezone?: string | null
): ColumnDef<Transfer>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <button
          onClick={() => onView(row.original)}
          className="font-mono font-medium text-[#1a1f36] hover:text-[#3b82f6] hover:underline cursor-pointer"
        >
          {row.getValue("code")}
        </button>
      ),
    },
    {
      accessorKey: "date_transferred",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date Transferred" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("date_transferred") as Date;
        return (
          <span className="text-sm tabular-nums text-[#1a1f36]">
            {formatInAppTimezone(date, "MMM dd, yyyy", timezone)}
          </span>
        );
      },
    },
    {
      accessorKey: "from_location_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From Location" />
      ),
      cell: ({ row }) => {
        const original = row.original as Transfer;
        const name = original.from_location_name;
        return name ? (
          <span className="text-[#64748b]">{name}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "to_location_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To Location" />
      ),
      cell: ({ row }) => {
        const original = row.original as Transfer;
        const name = original.to_location_name;
        return name ? (
          <span className="text-[#64748b]">{name}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
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
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Actions
          transfer={row.original}
          onView={onView}
          onEdit={onEdit}
          onCancel={onCancel}
        />
      ),
    },
  ];
}
