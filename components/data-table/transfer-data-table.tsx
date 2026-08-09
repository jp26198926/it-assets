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
  type ColumnFiltersState,
  type VisibilityState,
  type PaginationState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { TransferDataTableToolbar } from "./transfer-data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import type { Transfer, TransferFilters } from "@/lib/types/transfer";

interface TransferDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onView: (transfer: Transfer) => void;
  onEdit: (transfer: Transfer) => void;
  onCancel: (transfer: Transfer) => void;
  onAdd: () => void;
  onServerSearch?: (filters: TransferFilters) => void;
  onServerSearchClear?: () => void;
}

export function TransferDataTable<TData, TValue>({
  columns,
  data,
  onView,
  onEdit,
  onCancel,
  onAdd,
  onServerSearch,
  onServerSearchClear,
}: TransferDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
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
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      if (!search) return true;
      const value = String(row.getValue(columnId)).toLowerCase();
      return value.includes(search);
    },
  });

  return (
    <div className="space-y-4">
      <TransferDataTableToolbar
        table={table}
        onView={onView}
        onEdit={onEdit}
        onCancel={onCancel}
        onAdd={onAdd}
        onServerSearch={onServerSearch}
        onServerSearchClear={onServerSearchClear}
        allData={data}
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
                    data-state={row.getIsSelected() && "selected"}
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
                        <ClipboardList className="size-8 text-[#94a3b8]" />
                      </div>
                      <p className="font-semibold text-[#1a1f36]">No results found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
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
            const transfer = row.original as Transfer;
            return (
              <div
                key={row.id}
                className="bg-white shadow-sm p-4 border border-[#f0f4f8]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center bg-[#f0f4f8]">
                      <span className="text-[#3b82f6] text-lg">🔄</span>
                    </div>
                    <div>
                      <p className="font-medium text-[#1a1f36] font-mono">{transfer.code}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#64748b]">
                          {transfer.from_location_name || "N/A"} → {transfer.to_location_name || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(transfer)}
                      className="p-2 hover:bg-[#f0f4f8] transition-colors"
                    >
                      <span className="text-[#64748b]">👁️</span>
                    </button>
                    {transfer.status === "Active" && (
                      <>
                        <button
                          onClick={() => onEdit(transfer)}
                          className="p-2 hover:bg-[#f0f4f8] transition-colors"
                        >
                          <span className="text-[#64748b]">✏️</span>
                        </button>
                        <button
                          onClick={() => onCancel(transfer)}
                          className="p-2 hover:bg-red-50 transition-colors"
                        >
                          <span className="text-[#dc2626]">🚫</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white shadow-sm p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-3 text-[#64748b]">
              <div className="bg-[#f0f4f8] p-4">
                <ClipboardList className="size-8 text-[#94a3b8]" />
              </div>
              <p className="font-semibold text-[#1a1f36]">No results found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
