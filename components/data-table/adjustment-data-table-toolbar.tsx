"use client";

import { type Table } from "@tanstack/react-table";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthorization } from "@/hooks/use-authorization";
import type { AdjustmentFilters } from "@/lib/types/adjustment";

interface AdjustmentDataTableToolbarProps<TData> {
  table: Table<TData>;
  onAdd: () => void;
  onServerSearch?: (filters: AdjustmentFilters) => void;
  onServerSearchClear?: () => void;
}

export function AdjustmentDataTableToolbar<TData>({
  table,
  onAdd,
  onServerSearch,
  onServerSearchClear,
}: AdjustmentDataTableToolbarProps<TData>) {
  const { hasPermission } = useAuthorization();
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = table.getCoreRowModel().rows.length;
  const canAdd = hasPermission("/adjustments", "Add");

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {canAdd && (
            <Button size="sm" className="h-9 bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={onAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add Adjustment
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
            placeholder="Search adjustments..."
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
      </div>
    </div>
  );
}
