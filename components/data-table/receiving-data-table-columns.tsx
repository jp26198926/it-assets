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
import type { Receiving } from "@/lib/types/receiving";
import { DataTableColumnHeader } from "./data-table-column-header";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Completed: { color: "bg-[#dbeafe] text-[#2563eb]", dot: "bg-[#2563eb]" },
  Cancelled: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  receiving: Receiving;
  onView: (receiving: Receiving) => void;
  onEdit: (receiving: Receiving) => void;
  onCancel: (receiving: Receiving) => void;
}

function Actions({ receiving, onView, onEdit, onCancel }: ActionsProps) {
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/receivings", "Edit");
  const canDelete = hasPermission("/receivings", "Delete");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(receiving)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View
        </DropdownMenuItem>
        {canEdit && receiving.status === "Active" && (
          <DropdownMenuItem onClick={() => onEdit(receiving)} className="cursor-pointer gap-2 text-[#1a1f36]">
            <Edit className="h-4 w-4 text-[#64748b]" />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {canDelete && receiving.status === "Active" && (
          <DropdownMenuItem
            onClick={() => onCancel(receiving)}
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

export function createReceivingColumns(
  onView: (receiving: Receiving) => void,
  onEdit: (receiving: Receiving) => void,
  onCancel: (receiving: Receiving) => void,
  timezone?: string | null
): ColumnDef<Receiving>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium text-[#1a1f36]">{row.getValue("code")}</span>
      ),
    },
    {
      accessorKey: "date_received",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date Received" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("date_received") as Date;
        return (
          <span className="text-sm tabular-nums text-[#1a1f36]">
            {formatInAppTimezone(date, "MMM dd, yyyy", timezone)}
          </span>
        );
      },
    },
    {
      accessorKey: "supplier_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Supplier" />
      ),
      cell: ({ row }) => {
        const original = row.original as Receiving;
        const name = original.supplier_name;
        return name ? (
          <span className="text-[#64748b]">{name}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "po_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PO Number" />
      ),
      cell: ({ row }) => {
        const po = row.getValue("po_number") as string | null;
        return po ? (
          <span className="text-[#64748b]">{po}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "invoice_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice No" />
      ),
      cell: ({ row }) => {
        const inv = row.getValue("invoice_number") as string | null;
        return inv ? (
          <span className="text-[#64748b]">{inv}</span>
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
          receiving={row.original}
          onView={onView}
          onEdit={onEdit}
          onCancel={onCancel}
        />
      ),
    },
  ];
}
