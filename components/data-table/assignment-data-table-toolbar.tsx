"use client";

import { type Table } from "@tanstack/react-table";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { AssignmentAdvancedSearchDialog } from "./assignment-advanced-search-dialog";
import { AssignmentAdvancedFilterDialog } from "./assignment-advanced-filter-dialog";
import { AssignmentExportButtons } from "./assignment-export-buttons";
import { useAuthorization } from "@/hooks/use-authorization";
import type { Assignment, AssignmentFilters, AssignmentAdvancedFilter } from "@/lib/types/assignment";

interface AssignmentDataTableToolbarProps<TData> {
  table: Table<TData>;
  onView: (assignment: Assignment) => void;
  onEdit: (assignment: Assignment) => void;
  onReturn: (assignment: Assignment) => void;
  onMarkAsLost: (assignment: Assignment) => void;
  onRestore: (assignment: Assignment) => void;
  onAdd: () => void;
  onServerSearch?: (filters: AssignmentFilters) => void;
  onServerSearchClear?: () => void;
  advancedFilters: AssignmentAdvancedFilter[];
  onAdvancedFiltersChange: (filters: AssignmentAdvancedFilter[]) => void;
  allData: TData[];
}

export function AssignmentDataTableToolbar<TData>({
  table,
  onAdd,
  onServerSearch,
  onServerSearchClear,
  advancedFilters,
  onAdvancedFiltersChange,
  allData,
}: AssignmentDataTableToolbarProps<TData>) {
  const { hasPermission } = useAuthorization();
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = allData.length;
  const canAdd = hasPermission("/assignments", "Add");
  const canExport = hasPermission("/assignments", "Export");

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {canAdd && (
            <Button size="sm" className="h-9 bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={onAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add Assignment
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
            placeholder="Search assignments..."
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
            <AssignmentAdvancedSearchDialog
              onSearch={onServerSearch}
              onClear={onServerSearchClear || (() => {})}
            />
          )}
          <AssignmentAdvancedFilterDialog
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
          {canExport && <AssignmentExportButtons table={table} />}
        </div>
      </div>
    </div>
  );
}
