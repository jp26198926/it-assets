"use client";

import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Search, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { StockLevelAdvancedSearchDialog } from "./stock-level-advanced-search-dialog";
import { StockLevelExportButtons } from "./stock-level-export-buttons";
import { useAuthorization } from "@/hooks/use-authorization";
import { printStockLevels } from "@/lib/utils/print-stock-level";
import { toast } from "sonner";
import type { StockLevel, StockLevelFilters } from "@/lib/types/stock-level";

interface StockLevelDataTableToolbarProps<TData> {
  table: Table<TData>;
  onServerSearch?: (filters: StockLevelFilters) => void;
  onServerSearchClear?: () => void;
  allData: TData[];
}

export function StockLevelDataTableToolbar<TData>({
  table,
  onServerSearch,
  onServerSearchClear,
  allData,
}: StockLevelDataTableToolbarProps<TData>) {
  const { hasPermission } = useAuthorization();
  const [printing, setPrinting] = useState(false);
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = allData.length;
  const canExport = hasPermission("/stock-levels", "Export");

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const filteredLevels = table
        .getFilteredRowModel()
        .rows.map((row) => row.original as StockLevel);
      await printStockLevels(filteredLevels);
    } catch {
      toast.error("Failed to generate print");
    } finally {
      setPrinting(false);
    }
  };

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
            placeholder="Search stock levels..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
            className="h-9 sm:w-[200px] lg:w-[300px] pl-9 bg-[#f0f4f8] border-0 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onServerSearch && (
            <StockLevelAdvancedSearchDialog
              onSearch={onServerSearch}
              onClear={onServerSearchClear || (() => {})}
            />
          )}
          <DataTableViewOptions table={table} />
          {canExport && <StockLevelExportButtons table={table as unknown as Table<StockLevel>} />}
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handlePrint}
            disabled={printing}
          >
            {printing ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-1 h-4 w-4" />
            )}
            {printing ? "Printing..." : "Print"}
          </Button>
        </div>
      </div>
    </div>
  );
}
