"use client";

import { type Table } from "@tanstack/react-table";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { TicketCategoryAdvancedSearchDialog } from "./ticket-category-advanced-search-dialog";
import { TicketCategoryAdvancedFilterDialog } from "./ticket-category-advanced-filter-dialog";
import { TicketCategoryExportButtons } from "./ticket-category-export-buttons";
import { useAuthorization } from "@/hooks/use-authorization";
import type { TicketCategory, TicketCategoryFilters, TicketCategoryAdvancedFilter } from "@/lib/types/ticket-category";

interface TicketCategoryDataTableToolbarProps<TData> {
  table: Table<TData>;
  onView: (ticketCategory: TicketCategory) => void;
  onEdit: (ticketCategory: TicketCategory) => void;
  onDelete: (ticketCategory: TicketCategory) => void;
  onRestore: (ticketCategory: TicketCategory) => void;
  onAdd: () => void;
  onServerSearch?: (filters: TicketCategoryFilters) => void;
  onServerSearchClear?: () => void;
  advancedFilters: TicketCategoryAdvancedFilter[];
  onAdvancedFiltersChange: (filters: TicketCategoryAdvancedFilter[]) => void;
  allData: TData[];
}

export function TicketCategoryDataTableToolbar<TData>({
  table,
  onAdd,
  onServerSearch,
  onServerSearchClear,
  advancedFilters,
  onAdvancedFiltersChange,
  allData,
}: TicketCategoryDataTableToolbarProps<TData>) {
  const { hasPermission } = useAuthorization();
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = allData.length;
  const canAdd = hasPermission("/ticket-categories", "Add");
  const canExport = hasPermission("/ticket-categories", "Export");

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {canAdd && (
            <Button size="sm" className="h-9 bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={onAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add Ticket Category
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
            placeholder="Search ticket categories..."
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
            <TicketCategoryAdvancedSearchDialog
              onSearch={onServerSearch}
              onClear={onServerSearchClear || (() => {})}
            />
          )}
          <TicketCategoryAdvancedFilterDialog
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
          {canExport && <TicketCategoryExportButtons table={table as unknown as Table<TicketCategory>} />}
        </div>
      </div>
    </div>
  );
}
