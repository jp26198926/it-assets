"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { StockLevel } from "@/lib/types/stock-level";
import { DataTableColumnHeader } from "./data-table-column-header";

export function createStockLevelColumns(): ColumnDef<StockLevel>[] {
  return [
    {
      accessorKey: "item_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item Code" />
      ),
      cell: ({ row }) => {
        const original = row.original as StockLevel;
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
        const original = row.original as StockLevel;
        return (
          <span className="font-medium text-[#1a1f36]">
            {original.item_name || "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "location_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const original = row.original as StockLevel;
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
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      cell: ({ row }) => {
        const qty = row.getValue("qty") as number;
        return (
          <span className="text-sm tabular-nums text-[#1a1f36] font-medium">
            {qty.toLocaleString()}
          </span>
        );
      },
    },
  ];
}
