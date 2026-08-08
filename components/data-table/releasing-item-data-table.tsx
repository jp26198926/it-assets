"use client";

import { useMemo, useState } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Package } from "lucide-react";
import type { ReleasingItem } from "@/lib/types/releasing-item";

interface ReleasingItemDataTableProps {
  columns: ColumnDef<ReleasingItem>[];
  data: ReleasingItem[];
  onEdit: (item: ReleasingItem) => void;
  onDelete: (item: ReleasingItem) => void;
}

export function ReleasingItemDataTable({
  columns,
  data,
}: ReleasingItemDataTableProps) {
  const [showCancelled, setShowCancelled] = useState(false);

  const filteredData = useMemo(() => {
    if (showCancelled) return data;
    return data.filter((item) => item.status !== "Cancelled");
  }, [data, showCancelled]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show-cancelled"
          checked={showCancelled}
          onChange={(e) => setShowCancelled(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="show-cancelled" className="text-sm text-[#64748b]">
          Show cancelled items
        </label>
      </div>

      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-[#f0f4f8]">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-10 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-b border-[#f0f4f8] hover:bg-[#f8fafc]">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-[#64748b]">
                      <Package className="size-6 text-[#94a3b8]" />
                      <p className="text-sm">No items added yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const item = row.original as ReleasingItem;
            return (
              <div key={row.id} className="bg-white border border-[#f0f4f8] p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1a1f36] text-sm">{item.item_name || "N/A"}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">Qty: {item.qty}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-[#f0f4f8] p-6 text-center rounded-lg">
            <Package className="size-6 text-[#94a3b8] mx-auto mb-2" />
            <p className="text-sm text-[#64748b]">No items added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
