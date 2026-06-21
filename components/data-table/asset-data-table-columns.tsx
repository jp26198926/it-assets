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
import { useAuthorization } from "@/hooks/use-authorization";
import type { Asset } from "@/lib/types/asset";
import { DataTableColumnHeader } from "./data-table-column-header";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Available: { color: "bg-[#dbeafe] text-[#2563eb]", dot: "bg-[#2563eb]" },
  Assigned: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Repair: { color: "bg-[#fef3c7] text-[#d97706]", dot: "bg-[#d97706]" },
  Lost: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
  Disposed: { color: "bg-[#f3e8ff] text-[#9333ea]", dot: "bg-[#9333ea]" },
  Deleted: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  asset: Asset;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onRestore: (asset: Asset) => void;
}

function Actions({ asset, onView, onEdit, onDelete, onRestore }: ActionsProps) {
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/assets", "Edit");
  const canDelete = hasPermission("/assets", "Delete");
  const canRestore = hasPermission("/assets", "Restore");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(asset)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View Details
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(asset)} className="cursor-pointer gap-2 text-[#1a1f36]">
            <Edit className="h-4 w-4 text-[#64748b]" />
            Edit Asset
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!asset.deleted_at ? (
          canDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(asset)}
              className="cursor-pointer gap-2 text-[#dc2626]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )
        ) : (
          canRestore && (
            <DropdownMenuItem
              onClick={() => onRestore(asset)}
              className="cursor-pointer gap-2 text-[#059669]"
            >
              <RotateCcw className="h-4 w-4" />
              Restore
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function createAssetColumns(
  onView: (asset: Asset) => void,
  onEdit: (asset: Asset) => void,
  onDelete: (asset: Asset) => void,
  onRestore: (asset: Asset) => void
): ColumnDef<Asset>[] {
  return [
    {
      accessorKey: "barcode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Barcode" />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium text-[#1a1f36]">{row.getValue("barcode")}</span>
      ),
    },
    {
      accessorKey: "item_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item" />
      ),
      cell: ({ row }) => {
        const original = row.original as Asset;
        const name = original.item_name;
        return name ? (
          <span className="text-[#64748b]">{name}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "serial_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Serial Number" />
      ),
      cell: ({ row }) => {
        const serial = row.getValue("serial_number") as string | null;
        return serial ? (
          <span className="font-mono text-[#64748b]">{serial}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "location_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const original = row.original as Asset;
        const name = original.location_name;
        return name ? (
          <span className="text-[#64748b]">{name}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "assigned_to_employee_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => {
        const original = row.original as Asset;
        const name = original.assigned_to_employee_name;
        return name ? (
          <span className="text-[#64748b]">{name}</span>
        ) : (
          <span className="text-[#94a3b8] italic">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "assigned_to_department_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To (Dept)" />
      ),
      cell: ({ row }) => {
        const original = row.original as Asset;
        const name = original.assigned_to_department_name;
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
        const config = statusConfig[status] || statusConfig.Available;
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
          asset={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ),
    },
  ];
}
