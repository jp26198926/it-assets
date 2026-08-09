"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { formatInAppTimezone } from "@/lib/utils/timezone";
import type { StockMovement } from "@/lib/types/stock-movement";
import { DataTableColumnHeader } from "./data-table-column-header";

const typeConfig: Record<string, { color: string }> = {
  RECEIVE: { color: "bg-[#d1fae5] text-[#059669]" },
  RELEASE: { color: "bg-[#fee2e2] text-[#dc2626]" },
  ADJUSTMENT: { color: "bg-[#fef3c7] text-[#d97706]" }, // yellow
  TRANSFER: { color: "bg-[#ffedd5] text-[#ea580c]" }, // orange
  CANCEL: { color: "bg-[#dc2626] text-white" }, // red
};

export function createStockMovementColumns(
  timezone?: string | null,
): ColumnDef<StockMovement>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("date") as Date;
        return (
          <span className="text-sm tabular-nums text-[#1a1f36]">
            {formatInAppTimezone(date, "MMM dd, yyyy", timezone)}
          </span>
        );
      },
    },
    {
      accessorKey: "transaction_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("transaction_type") as string;
        const config = typeConfig[type] || typeConfig.RECEIVE;
        return (
          <div
            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${config.color}`}
          >
            {type}
          </div>
        );
      },
    },
    {
      accessorKey: "item_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item Code" />
      ),
      cell: ({ row }) => {
        const original = row.original as StockMovement;
        const code = original.item_code;
        return code ? (
          <span className="font-mono text-sm text-[#1a1f36]">{code}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "item_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item Name" />
      ),
      cell: ({ row }) => {
        const original = row.original as StockMovement;
        return (
          <span className="text-[#1a1f36]">{original.item_name || "N/A"}</span>
        );
      },
    },
    {
      accessorKey: "location_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const original = row.original as StockMovement;
        return (
          <span className="text-[#64748b]">
            {original.location_name || "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "qty",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty" />
      ),
      cell: ({ row }) => {
        const qty = row.getValue("qty") as number;
        const original = row.original as StockMovement;
        // const isReceive = original.transaction_type === "RECEIVE";
        return (
          <span
            className={`text-sm tabular-nums font-medium ${Number(qty) > 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
          >
            {qty.toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "reference_description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reference" />
      ),
      cell: ({ row }) => {
        const ref = row.getValue("reference_description") as string | null;
        return (
          <span className="text-sm text-[#64748b] font-mono">
            {ref || "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Remarks" />
      ),
      cell: ({ row }) => {
        const remarks = row.getValue("remarks") as string | null;
        return <span className="text-[#64748b]">{remarks || "N/A"}</span>;
      },
    },
  ];
}
