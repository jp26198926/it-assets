"use client";

import { type Table } from "@tanstack/react-table";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { AssetAdvancedSearchDialog } from "./asset-advanced-search-dialog";
import { AssetAdvancedFilterDialog } from "./asset-advanced-filter-dialog";
import { AssetExportButtons } from "./asset-export-buttons";
import { useAuthorization } from "@/hooks/use-authorization";
import type { Asset, AssetFilters, AssetAdvancedFilter } from "@/lib/types/asset";

interface AssetDataTableToolbarProps<TData> {
  table: Table<TData>;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onRestore: (asset: Asset) => void;
  onAdd: () => void;
  onServerSearch?: (filters: AssetFilters) => void;
  onServerSearchClear?: () => void;
  advancedFilters: AssetAdvancedFilter[];
  onAdvancedFiltersChange: (filters: AssetAdvancedFilter[]) => void;
  allData: TData[];
}

export function AssetDataTableToolbar<TData>({
  table,
  onAdd,
  onServerSearch,
  onServerSearchClear,
  advancedFilters,
  onAdvancedFiltersChange,
  allData,
}: AssetDataTableToolbarProps<TData>) {
  const { hasPermission } = useAuthorization();
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = allData.length;
  const canAdd = hasPermission("/assets", "Add");
  const canExport = hasPermission("/assets", "Export");

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {canAdd && (
            <Button size="sm" className="h-9 bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={onAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add Asset
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
            placeholder="Search assets..."
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
            <AssetAdvancedSearchDialog
              onSearch={onServerSearch}
              onClear={onServerSearchClear || (() => {})}
            />
          )}
          <AssetAdvancedFilterDialog
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
          {canExport && <AssetExportButtons table={table as unknown as Table<Asset>} />}
        </div>
      </div>
    </div>
  );
}
