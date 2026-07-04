"use client";

import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthorization } from "@/hooks/use-authorization";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import type { MeetingType, MeetingTypeAdvancedFilter } from "@/lib/types/meeting-type";

interface MeetingTypeDataTableToolbarProps {
  table: Table<MeetingType>;
  onView: (meetingType: MeetingType) => void;
  onEdit: (meetingType: MeetingType) => void;
  onDelete: (meetingType: MeetingType) => void;
  onRestore: (meetingType: MeetingType) => void;
  onAdd: () => void;
  onServerSearch?: (filters: { search?: string }) => void;
  onServerSearchClear?: () => void;
  advancedFilters: MeetingTypeAdvancedFilter[];
  onAdvancedFiltersChange: (filters: MeetingTypeAdvancedFilter[]) => void;
  allData: MeetingType[];
}

export function MeetingTypeDataTableToolbar({
  table,
  onAdd,
  onServerSearch,
  onServerSearchClear,
  advancedFilters,
  onAdvancedFiltersChange,
  allData,
}: MeetingTypeDataTableToolbarProps) {
  const { hasPermission } = useAuthorization();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onServerSearch) {
      onServerSearch({ search: searchValue || undefined });
    }
  };

  const handleSearchClear = () => {
    setSearchValue("");
    onServerSearchClear?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {hasPermission("/meeting-types", "Add") && (
          <Button onClick={onAdd} className="bg-[#3b82f6] hover:bg-[#2563eb]">
            <Plus className="mr-2 h-4 w-4" />
            Add Meeting Type
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {allData.length} row(s)
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meeting types..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="h-8 w-[200px] lg:w-[250px] pl-9 bg-[#f0f4f8] border-0"
          />
        </div>
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearchClear}
            className="h-8 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
