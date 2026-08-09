"use client";

import { type Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { StockMovementAdvancedSearchDialog } from "./stock-movement-advanced-search-dialog";
import { StockMovementExportButtons } from "./stock-movement-export-buttons";
import { useAuthorization } from "@/hooks/use-authorization";
import type { StockMovement, StockMovementFilters } from "@/lib/types/stock-movement";

interface StockMovementDataTableToolbarProps<TData> {
  table: Table<TData>;
  onServerSearch?: (filters: StockMovementFilters) => void;
  onServerSearchClear?: () => void;
  allData: TData[];
}

export function StockMovementDataTableToolbar<TData>({
  table,
  onServerSearch,
  onServerSearchClear,
  allData,
}: StockMovementDataTableToolbarProps<TData>) {
  const { hasPermission } = useAuthorization();
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = allData.length;
  const canExport = hasPermission("/stock-movements", "Export");

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748b]">
            {filteredCount} of {totalCount} row(s)
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
          <Input
            placeholder="Search stock movements..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
            className="h-9 sm:w-[200px] lg:w-[300px] pl-9 bg-[#f0f4f8] border-0 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onServerSearch && (
            <StockMovementAdvancedSearchDialog
              onSearch={onServerSearch}
              onClear={onServerSearchClear || (() => {})}
            />
          )}
          <DataTableViewOptions table={table} />
          {canExport && <StockMovementExportButtons table={table as unknown as Table<StockMovement>} />}
        </div>
      </div>
    </div>
  );
}
