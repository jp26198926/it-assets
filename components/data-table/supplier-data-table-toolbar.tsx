"use client";

import { type Table } from "@tanstack/react-table";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { SupplierAdvancedSearchDialog } from "./supplier-advanced-search-dialog";
import { SupplierAdvancedFilterDialog } from "./supplier-advanced-filter-dialog";
import { SupplierExportButtons } from "./supplier-export-buttons";
import { useAuthorization } from "@/hooks/use-authorization";
import type { Supplier, SupplierFilters, SupplierAdvancedFilter } from "@/lib/types/supplier";

interface SupplierDataTableToolbarProps<TData> {
  table: Table<TData>;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onRestore: (supplier: Supplier) => void;
  onAdd: () => void;
  onServerSearch?: (filters: SupplierFilters) => void;
  onServerSearchClear?: () => void;
  advancedFilters: SupplierAdvancedFilter[];
  onAdvancedFiltersChange: (filters: SupplierAdvancedFilter[]) => void;
  allData: TData[];
}

export function SupplierDataTableToolbar<TData>({
  table,
  onAdd,
  onServerSearch,
  onServerSearchClear,
  advancedFilters,
  onAdvancedFiltersChange,
  allData,
}: SupplierDataTableToolbarProps<TData>) {
  const { hasPermission } = useAuthorization();
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = allData.length;
  const canAdd = hasPermission("/suppliers", "Add");
  const canExport = hasPermission("/suppliers", "Export");

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {canAdd && (
            <Button size="sm" className="h-9 bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={onAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add Supplier
            </Button>
          )}
          <span className="text-sm text-[#64748b]">
            {filteredCount} of {totalCount} row(s)
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
          <Input
            placeholder="Search suppliers..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
              if (onServerSearch && event.target.value === "") {
                onServerSearchClear?.();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && onServerSearch) {
                onServerSearch({ search: event.currentTarget.value });
              }
            }}
            className="h-9 sm:w-[200px] lg:w-[300px] pl-9 bg-[#f0f4f8] border-0 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onServerSearch && (
            <SupplierAdvancedSearchDialog
              onSearch={onServerSearch}
              onClear={onServerSearchClear || (() => {})}
            />
          )}
          <SupplierAdvancedFilterDialog
            filters={advancedFilters}
            onFiltersChange={onAdvancedFiltersChange}
          />
          {advancedFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAdvancedFiltersChange([])}
              className="h-8 text-xs text-[#64748b] hover:text-[#1a1f36]"
            >
              Clear ({advancedFilters.length})
            </Button>
          )}
          <DataTableViewOptions table={table} />
          {canExport && <SupplierExportButtons table={table as unknown as Table<Supplier>} />}
        </div>
      </div>
    </div>
  );
}
