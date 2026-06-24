"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X, ChevronDown } from "lucide-react";
import type { TicketReportFilters } from "@/lib/types/ticket-report";

interface FilterOption {
  id: string;
  name: string;
}

const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"];

interface DateRangeFilterProps {
  filters: TicketReportFilters;
  onFiltersChange: (filters: TicketReportFilters) => void;
  onApply: () => void;
}

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export function DateRangeFilter({ filters, onFiltersChange, onApply }: DateRangeFilterProps) {
  const [technicians, setTechnicians] = useState<FilterOption[]>([]);
  const [departments, setDepartments] = useState<FilterOption[]>([]);
  const [requestors, setRequestors] = useState<FilterOption[]>([]);
  const defaults = getDefaultDateRange();

  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch("/api/tickets/select-options");
        const data = await res.json();
        if (data.success) {
          setTechnicians(data.data.users || []);
          setDepartments(data.data.departments || []);
          setRequestors(data.data.users || []);
        }
      } catch {
        // ignore
      }
    }
    loadOptions();
  }, []);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <input
          type="date"
          value={filters.date_from || defaults.from}
          onChange={(e) => onFiltersChange({ ...filters, date_from: e.target.value })}
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <input
          type="date"
          value={filters.date_to || defaults.to}
          onChange={(e) => onFiltersChange({ ...filters, date_to: e.target.value })}
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Technician</label>
        <Select
          value={filters.technician_id || "all"}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, technician_id: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]" size="sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem>
            {technicians.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Department</label>
        <Select
          value={filters.department_id || "all"}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, department_id: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]" size="sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Requestor</label>
        <Select
          value={filters.requestor_id || "all"}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, requestor_id: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]" size="sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requestors</SelectItem>
            {requestors.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Status</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-[160px] justify-between">
              {filters.status && filters.status.length > 0
                ? `Status (${filters.status.length})`
                : "All Statuses"}
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[160px] p-2">
            <div className="space-y-1">
              {STATUS_OPTIONS.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={filters.status?.includes(status) ?? false}
                    onCheckedChange={(checked) => {
                      const current = filters.status || [];
                      const updated = checked
                        ? [...current, status]
                        : current.filter((s) => s !== status);
                      onFiltersChange({
                        ...filters,
                        status: updated.length > 0 ? updated : undefined,
                      });
                    }}
                  />
                  {status}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Button size="sm" onClick={onApply}>
        <Search className="size-4" />
        Apply
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          onFiltersChange({
            date_from: defaults.from,
            date_to: defaults.to,
          });
          onApply();
        }}
      >
        <X className="size-4" />
        Clear
      </Button>
    </div>
  );
}
