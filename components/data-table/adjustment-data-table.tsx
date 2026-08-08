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
  type SortingState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowUpDown, Plus } from "lucide-react";
import { DataTablePagination } from "./data-table-pagination";
import { AdjustmentDataTableToolbar } from "./adjustment-data-table-toolbar";
import type { Adjustment } from "@/lib/types/adjustment";
import type { AdjustmentFilters } from "@/lib/types/adjustment";

interface AdjustmentDataTableProps {
  columns: ColumnDef<Adjustment>[];
  data: Adjustment[];
  onView: (adjustment: Adjustment) => void;
  onAdd: () => void;
  onServerSearch: (filters: AdjustmentFilters) => void;
  onServerSearchClear: () => void;
}

export function AdjustmentDataTable({
  columns,
  data,
  onView,
  onAdd,
  onServerSearch,
  onServerSearchClear,
}: AdjustmentDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      <AdjustmentDataTableToolbar
        table={table}
        onAdd={onAdd}
        onServerSearch={onServerSearch}
        onServerSearchClear={onServerSearchClear}
      />

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-[#3b82f6] hover:bg-[#3b82f6]">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-12 text-xs font-semibold uppercase tracking-wider text-white">
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
                    className="border-b border-[#f0f4f8] transition-colors hover:bg-[#f8fafc] last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
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
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 text-[#64748b]">
                      <div className="bg-[#f0f4f8] p-4">
                        <ArrowUpDown className="size-8 text-[#94a3b8]" />
                      </div>
                      <p className="font-semibold text-[#1a1f36]">No adjustments found</p>
                      <p className="text-sm">Create a new adjustment to get started</p>
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
            const adjustment = row.original as Adjustment;
            const isPositive = adjustment.qty >= 0;
            return (
              <div
                key={row.id}
                className="bg-white shadow-sm p-4 border border-[#f0f4f8]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center ${isPositive ? "bg-emerald-50" : "bg-rose-50"}`}>
                      <span className={`text-lg ${isPositive ? "text-[#059669]" : "text-[#dc2626]"}`}>
                        {isPositive ? "📈" : "📉"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#1a1f36]">{adjustment.item_name || "N/A"}</p>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {adjustment.code} • {adjustment.location_name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold tabular-nums ${isPositive ? "text-[#059669]" : "text-[#dc2626]"}`}>
                      {isPositive ? "+" : ""}{adjustment.qty.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#64748b]">ADJUSTMENT</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white shadow-sm p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-3 text-[#64748b]">
              <div className="bg-[#f0f4f8] p-4">
                <ArrowUpDown className="size-8 text-[#94a3b8]" />
              </div>
              <p className="font-semibold text-[#1a1f36]">No adjustments found</p>
              <p className="text-sm">Create a new adjustment to get started</p>
            </div>
          </div>
        )}
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
