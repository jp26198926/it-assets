"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format, isAfter } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import type { ITAsset } from "@/lib/types";
import { DataTableColumnHeader } from "./data-table-column-header";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  "In Use": { color: "bg-[#e8f0fe] text-[#3b82f6]", dot: "bg-[#3b82f6]" },
  Maintenance: { color: "bg-[#fef3c7] text-[#d97706]", dot: "bg-[#d97706]" },
  Retired: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
  Available: { color: "bg-[#ede9fe] text-[#7c3aed]", dot: "bg-[#7c3aed]" },
};

interface ActionsProps {
  asset: ITAsset;
  onView: (asset: ITAsset) => void;
  onEdit: (asset: ITAsset) => void;
  onDelete: (asset: ITAsset) => void;
  onRestore: (asset: ITAsset) => void;
}

function Actions({ asset, onView, onEdit, onDelete, onRestore }: ActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(asset)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Edit className="h-4 w-4 text-[#64748b]" />
          Edit Asset
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!asset.isDeleted ? (
          <DropdownMenuItem
            onClick={() => onDelete(asset)}
            className="cursor-pointer gap-2 text-[#dc2626]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onRestore(asset)}
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

export function createColumns(
  onView: (asset: ITAsset) => void,
  onEdit: (asset: ITAsset) => void,
  onDelete: (asset: ITAsset) => void,
  onRestore: (asset: ITAsset) => void
): ColumnDef<ITAsset>[] {
  return [
    {
      accessorKey: "assetTag",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Asset Tag" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold bg-[#f0f4f8] text-[#1a1f36] px-2 py-1">
          {row.getValue("assetTag")}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-[#1a1f36]">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[#64748b]">{row.getValue("type")}</span>
      ),
    },
    {
      id: "brandModel",
      accessorFn: (row) => `${row.brand} ${row.model}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand / Model" />
      ),
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-[#1a1f36]">{row.original.brand}</span>
          <span className="text-[#64748b] ml-1">{row.original.model}</span>
        </div>
      ),
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
      accessorKey: "assignedTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("assignedTo") as string;
        return value ? (
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center bg-[#e8f0fe] text-[#3b82f6] text-[10px] font-bold">
              {value.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <span className="text-sm font-medium text-[#1a1f36]">{value}</span>
          </div>
        ) : (
          <span className="text-sm text-[#94a3b8] italic">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-[#1a1f36]">
          {row.getValue("location")}
        </div>
      ),
    },
    {
      accessorKey: "purchaseDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Purchase Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("purchaseDate") as string;
        return (
          <span className="text-sm tabular-nums text-[#1a1f36]">
            {format(new Date(date), "MMM dd, yyyy")}
          </span>
        );
      },
    },
    {
      accessorKey: "warrantyExpiry",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Warranty Expiry" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("warrantyExpiry") as string;
        const expiry = new Date(date);
        const isExpired = !isAfter(expiry, new Date());
        return (
          <span className={`text-sm tabular-nums ${isExpired ? "text-[#dc2626] font-semibold" : "text-[#1a1f36]"}`}>
            {format(expiry, "MMM dd, yyyy")}
            {isExpired && (
              <span className="ml-1.5 text-[10px] font-bold bg-[#fee2e2] text-[#dc2626] px-2 py-0.5">
                Expired
              </span>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: "purchaseCost",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cost" />
      ),
      cell: ({ row }) => {
        const cost = row.getValue("purchaseCost") as number;
        return (
          <span className="text-sm font-semibold tabular-nums text-[#1a1f36]">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(cost)}
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
