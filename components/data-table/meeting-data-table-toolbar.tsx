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
import { MeetingExportButtons } from "./meeting-export-buttons";
import type { Meeting, MeetingAdvancedFilter, MeetingFilters } from "@/lib/types/meeting";
import type { MeetingTypeSelectOption } from "@/lib/types/meeting";

interface MeetingDataTableToolbarProps {
  table: Table<Meeting>;
  onView: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onRestore: (meeting: Meeting) => void;
  onAdd: () => void;
  onServerSearch?: (filters: MeetingFilters) => void;
  onServerSearchClear?: () => void;
  advancedFilters: MeetingAdvancedFilter[];
  onAdvancedFiltersChange: (filters: MeetingAdvancedFilter[]) => void;
  allData: Meeting[];
  meetingTypes?: MeetingTypeSelectOption[];
  statuses?: { value: string; label: string }[];
}

export function MeetingDataTableToolbar({
  table,
  onAdd,
  onServerSearch,
  onServerSearchClear,
  advancedFilters,
  onAdvancedFiltersChange,
  allData,
  meetingTypes = [],
  statuses = [],
}: MeetingDataTableToolbarProps) {
  const { hasPermission } = useAuthorization();
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onServerSearch) {
      const filters: MeetingFilters = { search: searchValue || undefined };
      if (filterType) filters.meeting_type_id = filterType;
      if (filterStatus) filters.status = filterStatus;
      onServerSearch(filters);
    }
  };

  const handleSearchClear = () => {
    setSearchValue("");
    setFilterType("");
    setFilterStatus("");
    onServerSearchClear?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {hasPermission("/meetings", "Add") && (
          <Button onClick={onAdd} className="bg-[#3b82f6] hover:bg-[#2563eb]">
            <Plus className="mr-2 h-4 w-4" />
            Add Meeting
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
            placeholder="Search meetings..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="h-8 w-[200px] lg:w-[250px] pl-9 bg-[#f0f4f8] border-0"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(val) => {
            setFilterType(val === "all" ? "" : val);
            if (onServerSearch) {
              onServerSearch({
                search: searchValue || undefined,
                meeting_type_id: val === "all" ? undefined : val,
                status: filterStatus || undefined,
              });
            }
          }}
        >
          <SelectTrigger className="h-8 w-[160px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {meetingTypes.map((mt) => (
              <SelectItem key={mt.id} value={mt.id}>
                {mt.name}
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
                meeting_type_id: filterType || undefined,
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
        {hasPermission("/meetings", "Export") && (
          <MeetingExportButtons table={table} />
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
