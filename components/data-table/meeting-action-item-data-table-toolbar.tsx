"use client";

import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthorization } from "@/hooks/use-authorization";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import type {
  MeetingActionItem,
  MeetingActionItemAdvancedFilter,
  MeetingActionItemFilters,
} from "@/lib/types/meeting-action-item";

interface MeetingActionItemDataTableToolbarProps {
  table: Table<MeetingActionItem>;
  onView: (item: MeetingActionItem) => void;
  onEdit: (item: MeetingActionItem) => void;
  onDelete: (item: MeetingActionItem) => void;
  onRestore: (item: MeetingActionItem) => void;
  onAdd: () => void;
  onServerSearch?: (filters: MeetingActionItemFilters) => void;
  onServerSearchClear?: () => void;
  advancedFilters: MeetingActionItemAdvancedFilter[];
  onAdvancedFiltersChange: (filters: MeetingActionItemAdvancedFilter[]) => void;
  allData: MeetingActionItem[];
  statuses?: { value: string; label: string }[];
  priorities?: { value: string; label: string }[];
}

export function MeetingActionItemDataTableToolbar({
  table,
  onAdd,
  onServerSearch,
  onServerSearchClear,
  advancedFilters,
  onAdvancedFiltersChange,
  allData,
  statuses = [],
  priorities = [],
}: MeetingActionItemDataTableToolbarProps) {
  const { hasPermission } = useAuthorization();
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onServerSearch) {
      const filters: MeetingActionItemFilters = {
        search: searchValue || undefined,
      };
      if (filterStatus) filters.status = filterStatus;
      if (filterPriority) filters.priority = filterPriority;
      onServerSearch(filters);
    }
  };

  const handleSearchClear = () => {
    setSearchValue("");
    setFilterStatus("");
    setFilterPriority("");
    onServerSearchClear?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {hasPermission("/meeting-action-items", "Add") && (
          <Button onClick={onAdd} className="bg-[#3b82f6] hover:bg-[#2563eb]">
            <Plus className="mr-2 h-4 w-4" />
            Add Action Item
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
            placeholder="Search action items..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="h-8 w-[200px] lg:w-[250px] pl-9 bg-[#f0f4f8] border-0"
          />
        </div>
        <Select
          value={filterPriority}
          onValueChange={(val) => {
            setFilterPriority(val === "all" ? "" : val);
            if (onServerSearch) {
              onServerSearch({
                search: searchValue || undefined,
                status: filterStatus || undefined,
                priority: val === "all" ? undefined : val,
              });
            }
          }}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={(val) => {
            setFilterStatus(val === "all" ? "" : val);
            if (onServerSearch) {
              onServerSearch({
                search: searchValue || undefined,
                priority: filterPriority || undefined,
                status: val === "all" ? undefined : val,
              });
            }
          }}
        >
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
