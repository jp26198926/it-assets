"use client";

import { type Table } from "@tanstack/react-table";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { ExportButtons } from "./export-buttons";
import { AdvancedFilterDialog } from "./advanced-filter-dialog";
import { AdvancedSearchDialog } from "./advanced-search-dialog";
import type { ITAsset, AdvancedFilter } from "@/lib/types";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onView: (asset: ITAsset) => void;
  onEdit: (asset: ITAsset) => void;
  onDelete: (asset: ITAsset) => void;
  onRestore: (asset: ITAsset) => void;
  onAdd: () => void;
  advancedFilters: AdvancedFilter[];
  onAdvancedFiltersChange: (filters: AdvancedFilter[]) => void;
  allData: TData[];
}

export function DataTableToolbar<TData>({
  table,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onAdd,
  advancedFilters,
  onAdvancedFiltersChange,
  allData,
}: DataTableToolbarProps<TData>) {
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = allData.length;

  return (
    <div className="space-y-3">
      {/* Mobile: Stacked layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-9 bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={onAdd}>
            <Plus className="mr-1 h-4 w-4" />
            Add Asset
          </Button>
          <span className="text-sm text-[#64748b]">
            {filteredCount} of {totalCount} row(s)
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
          <Input
            placeholder="Search assets..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) =>
              table.setGlobalFilter(event.target.value)
            }
            className="h-9 sm:w-[200px] lg:w-[300px] pl-9 bg-[#f0f4f8] border-0 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <AdvancedSearchDialog
            table={table}
            allData={allData}
          />
          <AdvancedFilterDialog
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
          <ExportButtons table={table} />
        </div>
      </div>
    </div>
  );
}
