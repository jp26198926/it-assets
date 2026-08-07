"use client";

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
import type { ReceivingItem } from "@/lib/types/receiving-item";

interface ReceivingItemDataTableProps {
  columns: ColumnDef<ReceivingItem>[];
  data: ReceivingItem[];
  onEdit: (item: ReceivingItem) => void;
  onDelete: (item: ReceivingItem) => void;
}

export function ReceivingItemDataTable({
  columns,
  data,
}: ReceivingItemDataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
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
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-[#f0f4f8] hover:bg-[#f8fafc]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
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

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const item = row.original as ReceivingItem;
            return (
              <div
                key={row.id}
                className="bg-white border border-[#f0f4f8] p-3 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1a1f36] text-sm">
                      {item.item_name || "N/A"}
                    </p>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Qty: {item.qty} | Price: {item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => (row.original as ReceivingItem)}
                      className="p-1.5 hover:bg-[#f0f4f8] transition-colors text-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => (row.original as ReceivingItem)}
                      className="p-1.5 hover:bg-red-50 transition-colors text-xs"
                    >
                      🗑️
                    </button>
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
