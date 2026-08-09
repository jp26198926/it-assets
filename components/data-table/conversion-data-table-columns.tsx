"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { formatInAppTimezone } from "@/lib/utils/timezone";
import type { Conversion } from "@/lib/types/conversion";

export function createConversionColumns(
  onView: (conversion: Conversion) => void,
  timezone?: string | null,
): ColumnDef<Conversion>[] {
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
      accessorKey: "date_converted",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("date_converted") as Date;
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
      accessorKey: "from_item_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From Item" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const name = item.from_item_name || "—";
        const code = item.from_item_code;
        return (
          <div>
            <div className="font-medium">{name}</div>
            {code && <div className="text-xs text-muted-foreground">{code}</div>}
          </div>
        );
      },
    },
    {
      accessorKey: "to_item_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To Item" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const name = item.to_item_name || "—";
        const code = item.to_item_code;
        return (
          <div>
            <div className="font-medium">{name}</div>
            {code && <div className="text-xs text-muted-foreground">{code}</div>}
          </div>
        );
      },
    },
    {
      accessorKey: "from_qty",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From Qty" />
      ),
      cell: ({ row }) => {
        const qty = row.getValue("from_qty") as number;
        return (
          <span className="font-medium text-red-600">
            -{qty}
          </span>
        );
      },
    },
    {
      accessorKey: "to_qty",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To Qty" />
      ),
      cell: ({ row }) => {
        const qty = row.getValue("to_qty") as number;
        return (
          <span className="font-medium text-emerald-600">
            +{qty}
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
