"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useAuthorization } from "@/hooks/use-authorization";
import type { ReleasingItem } from "@/lib/types/releasing-item";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Completed: { color: "bg-[#dbeafe] text-[#2563eb]", dot: "bg-[#2563eb]" },
  Cancelled: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  item: ReleasingItem;
  onEdit: (item: ReleasingItem) => void;
  onDelete: (item: ReleasingItem) => void;
}

function Actions({ item, onEdit, onDelete }: ActionsProps) {
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/releasings", "Edit");
  const canDelete = hasPermission("/releasings", "Delete");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        {canEdit && item.status === "Active" && (
          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2 text-[#1a1f36]">
            <Edit className="h-4 w-4 text-[#64748b]" />
            Edit
          </DropdownMenuItem>
        )}
        {canEdit && item.status === "Active" && <DropdownMenuSeparator />}
        {canDelete && item.status === "Active" && (
          <DropdownMenuItem
            onClick={() => onDelete(item)}
            className="cursor-pointer gap-2 text-[#dc2626]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function createReleasingItemColumns(
  onEdit: (item: ReleasingItem) => void,
  onDelete: (item: ReleasingItem) => void
): ColumnDef<ReleasingItem>[] {
  return [
    {
      accessorKey: "code",
      header: "Series #",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-[#1a1f36]">{row.getValue("code")}</span>
      ),
    },
    {
      accessorKey: "item_name",
      header: "Item Description",
      cell: ({ row }) => {
        const original = row.original as ReleasingItem;
        const name = original.item_name || "N/A";
        const code = original.item_code;
        return (
          <span className="text-[#1a1f36]">
            {code ? `${code} - ${name}` : name}
          </span>
        );
      },
    },
    {
      accessorKey: "qty",
      header: "Qty",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-[#1a1f36] text-right block">
          {(row.getValue("qty") as number).toFixed(4)}
        </span>
      ),
    },
    {
      accessorKey: "item_uom_name",
      header: "UOM",
      cell: ({ row }) => {
        const original = row.original as ReleasingItem;
        return <span className="text-[#64748b]">{original.item_uom_name || "N/A"}</span>;
      },
    },
    {
      accessorKey: "from_location_name",
      header: "Location",
      cell: ({ row }) => {
        const original = row.original as ReleasingItem;
        return <span className="text-[#64748b]">{original.from_location_name || "N/A"}</span>;
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const remarks = row.getValue("remarks") as string | null;
        return <span className="text-[#64748b]">{remarks || "N/A"}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const config = statusConfig[status] || statusConfig.Active;
        return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${config.color}`}>
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
        <Actions item={row.original} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];
}
