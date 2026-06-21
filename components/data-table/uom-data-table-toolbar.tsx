"use client";

import { type Table } from "@tanstack/react-table";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { UOMAdvancedSearchDialog } from "./uom-advanced-search-dialog";
import { UOMAdvancedFilterDialog } from "./uom-advanced-filter-dialog";
import { UOMExportButtons } from "./uom-export-buttons";
import { useAuthorization } from "@/hooks/use-authorization";
import type { UOM, UOMFilters, UOMAdvancedFilter } from "@/lib/types/uom";

interface UOMDataTableToolbarProps<TData> {
  table: Table<TData>;
  onView: (uom: UOM) => void;
  onEdit: (uom: UOM) => void;
  onDelete: (uom: UOM) => void;
  onRestore: (uom: UOM) => void;
  onAdd: () => void;
  onServerSearch?: (filters: UOMFilters) => void;
  onServerSearchClear?: () => void;
  advancedFilters: UOMAdvancedFilter[];
  onAdvancedFiltersChange: (filters: UOMAdvancedFilter[]) => void;
  allData: TData[];
}

export function UOMDataTableToolbar<TData>({
  table,
  onAdd,
  onServerSearch,
  onServerSearchClear,
  advancedFilters,
  onAdvancedFiltersChange,
  allData,
}: UOMDataTableToolbarProps<TData>) {
  const { hasPermission } = useAuthorization();
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = allData.length;
  const canAdd = hasPermission("/uoms", "Add");
  const canExport = hasPermission("/uoms", "Export");

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {canAdd && (
            <Button size="sm" className="h-9 bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={onAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add UOM
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
            placeholder="Search UOMs..."
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
            <UOMAdvancedSearchDialog
              onSearch={onServerSearch}
              onClear={onServerSearchClear || (() => {})}
            />
          )}
          <UOMAdvancedFilterDialog
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
          {canExport && <UOMExportButtons table={table} />}
        </div>
      </div>
    </div>
  );
}
