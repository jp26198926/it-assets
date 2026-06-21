"use client";

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
import { useState, useMemo } from "react";
import { Package } from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssetDataTableToolbar } from "./asset-data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import type { Asset, AssetAdvancedFilter, AssetFilters } from "@/lib/types/asset";

interface AssetDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onRestore: (asset: Asset) => void;
  onAdd: () => void;
  onServerSearch?: (filters: AssetFilters) => void;
  onServerSearchClear?: () => void;
}

export function AssetDataTable<TData, TValue>({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onAdd,
  onServerSearch,
  onServerSearchClear,
}: AssetDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [advancedFilters, setAdvancedFilters] = useState<AssetAdvancedFilter[]>([]);

  const filteredData = useMemo(() => {
    if (advancedFilters.length === 0) return data;

    return data.filter((item) => {
      const record = item as Record<string, unknown>;
      return advancedFilters.every((filter) => {
        const fieldValue = String(record[filter.field] ?? "").toLowerCase();
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case "equals":
            return fieldValue === filterValue;
          case "contains":
            return fieldValue.includes(filterValue);
          case "greaterThan":
            return Number(fieldValue) > Number(filterValue);
          case "lessThan":
            return Number(fieldValue) < Number(filterValue);
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
      <AssetDataTableToolbar
        table={table}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
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
                        <Package className="size-8 text-[#94a3b8]" />
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
            const asset = row.original as Asset;
            return (
              <div
                key={row.id}
                className="bg-white shadow-sm p-4 border border-[#f0f4f8]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center bg-[#f0f4f8]">
                      <Package className="size-5 text-[#3b82f6]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1a1f36]">{asset.barcode}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {asset.item_name && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-[#dbeafe] text-[#2563eb]">
                            {asset.item_name}
                          </span>
                        )}
                        <span className="text-xs text-[#64748b]">{asset.serial_number || "No serial"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(asset)}
                      className="p-2 hover:bg-[#f0f4f8] transition-colors"
                    >
                      <span className="text-[#64748b]">&#128065;</span>
                    </button>
                    <button
                      onClick={() => onEdit(asset)}
                      className="p-2 hover:bg-[#f0f4f8] transition-colors"
                    >
                      <span className="text-[#64748b]">&#9998;</span>
                    </button>
                    {!asset.deleted_at ? (
                      <button
                        onClick={() => onDelete(asset)}
                        className="p-2 hover:bg-red-50 transition-colors"
                      >
                        <span className="text-[#dc2626]">&#128465;</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onRestore(asset)}
                        className="p-2 hover:bg-green-50 transition-colors"
                      >
                        <span className="text-[#059669]">&#9851;</span>
                      </button>
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
                <Package className="size-8 text-[#94a3b8]" />
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
