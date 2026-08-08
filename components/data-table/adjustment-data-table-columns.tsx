"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { formatInAppTimezone } from "@/lib/utils/timezone";
import type { Adjustment } from "@/lib/types/adjustment";

export function createAdjustmentColumns(
  onView: (adjustment: Adjustment) => void,
  timezone?: string | null,
): ColumnDef<Adjustment>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => {
        const code = row.getValue("code") as string;
        return (
          <button
            onClick={() => onView(row.original)}
            className="font-mono font-medium text-[#1a1f36] hover:text-[#3b82f6] hover:underline cursor-pointer"
          >
            {code}
          </button>
        );
      },
    },
    {
      accessorKey: "date_adjusted",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date Adjusted" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("date_adjusted") as Date;
        if (!date) return "—";
        return formatInAppTimezone(date, "MMM dd, yyyy", timezone);
      },
    },
    {
      accessorKey: "location_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("location_name") as string;
        return name || "—";
      },
    },
    {
      accessorKey: "item_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const name = item.item_name || "—";
        const code = item.item_code;
        return (
          <div>
            <div className="font-medium">{name}</div>
            {code && <div className="text-xs text-muted-foreground">{code}</div>}
          </div>
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
          <span className={`font-medium ${qty >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {qty >= 0 ? "+" : ""}{qty}
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
        return (
          <span className="text-muted-foreground truncate max-w-[200px] block">
            {remarks || "—"}
          </span>
        );
      },
    },
  ];
}
