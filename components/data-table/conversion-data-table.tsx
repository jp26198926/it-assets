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
  type VisibilityState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { DataTablePagination } from "./data-table-pagination";
import { ConversionDataTableToolbar } from "./conversion-data-table-toolbar";
import type { Conversion, ConversionFilters, ConversionAdvancedFilter } from "@/lib/types/conversion";

interface ConversionDataTableProps {
  columns: ColumnDef<Conversion>[];
  data: Conversion[];
  onView: (conversion: Conversion) => void;
  onAdd: () => void;
  onServerSearch: (filters: ConversionFilters) => void;
  onServerSearchClear: () => void;
}

export function ConversionDataTable({
  columns,
  data,
  onView,
  onAdd,
  onServerSearch,
  onServerSearchClear,
}: ConversionDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [advancedFilters, setAdvancedFilters] = useState<ConversionAdvancedFilter[]>([]);

  const filteredData = useMemo(() => {
    if (advancedFilters.length === 0) return data;

    return data.filter((item) => {
      const record = item as unknown as Record<string, unknown>;
      return advancedFilters.every((filter) => {
        const fieldValue = String(record[filter.field] ?? "").toLowerCase();
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case "equals":
            return fieldValue === filterValue;
          case "contains":
            return fieldValue.includes(filterValue);
          case "startsWith":
            return fieldValue.startsWith(filterValue);
          default:
            return true;
        }
      });
    });
  }, [data, advancedFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      <ConversionDataTableToolbar
        table={table}
        onAdd={onAdd}
        onServerSearch={onServerSearch}
        onServerSearchClear={onServerSearchClear}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={setAdvancedFilters}
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
                        <RefreshCw className="size-8 text-[#94a3b8]" />
                      </div>
                      <p className="font-semibold text-[#1a1f36]">No conversions found</p>
                      <p className="text-sm">Create a new conversion to get started</p>
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
            const conversion = row.original as Conversion;
            return (
              <div
                key={row.id}
                className="bg-white shadow-sm p-4 border border-[#f0f4f8]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center bg-blue-50">
                      <span className="text-lg text-[#3b82f6]">
                        <RefreshCw className="size-5" />
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#1a1f36]">
                        {conversion.from_item_name || "N/A"} → {conversion.to_item_name || "N/A"}
                      </p>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {conversion.code} • {conversion.location_name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#64748b]">
                      <span className="text-red-600">-{conversion.from_qty}</span>
                      {" → "}
                      <span className="text-emerald-600">+{conversion.to_qty}</span>
                    </p>
                    <p className="text-xs text-[#64748b]">CONVERSION</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white shadow-sm p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-3 text-[#64748b]">
              <div className="bg-[#f0f4f8] p-4">
                <RefreshCw className="size-8 text-[#94a3b8]" />
              </div>
              <p className="font-semibold text-[#1a1f36]">No conversions found</p>
              <p className="text-sm">Create a new conversion to get started</p>
            </div>
          </div>
        )}
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
