"use client";

import { useState } from "react";
import { Filter, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Ticket, TicketAdvancedFilter } from "@/lib/types/ticket";

interface TicketAdvancedFilterDialogProps {
  filters: TicketAdvancedFilter[];
  onFiltersChange: (filters: TicketAdvancedFilter[]) => void;
  buttonLabel?: string;
}

const filterFields: { value: keyof Ticket; label: string }[] = [
  { value: "ticket_no", label: "Ticket No" },
  { value: "title", label: "Title" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "department_name", label: "Department" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
];

const filterOperators: { value: TicketAdvancedFilter["operator"]; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts with" },
];

export function TicketAdvancedFilterDialog({
  filters,
  onFiltersChange,
  buttonLabel,
}: TicketAdvancedFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TicketAdvancedFilter[]>(filters);

  const addFilter = () => {
    setDraft([...draft, { field: "title", operator: "contains", value: "" }]);
  };

  const removeFilter = (index: number) => {
    setDraft(draft.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<TicketAdvancedFilter>) => {
    const updated = [...draft];
    updated[index] = { ...updated[index], ...updates };
    setDraft(updated);
  };

  const handleApply = () => {
    onFiltersChange(draft.filter((f) => f.value.trim() !== ""));
    setOpen(false);
  };

  const handleClear = () => {
    setDraft([]);
    onFiltersChange([]);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) setDraft(filters);
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Filter className="mr-1 h-4 w-4" />
          {buttonLabel || "Advanced Filter"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filter</DialogTitle>
          <DialogDescription>
            Add filter conditions to narrow down results.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {draft.map((filter, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Field</Label>
                <select
                  value={filter.field}
                  onChange={(e) => updateFilter(index, { field: e.target.value as keyof Ticket })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {filterFields.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Operator</Label>
                <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(index, { operator: e.target.value as TicketAdvancedFilter["operator"] })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {filterOperators.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Value</Label>
                <Input
                  value={filter.value}
                  onChange={(e) => updateFilter(index, { value: e.target.value })}
                  placeholder="Filter value..."
                  className="h-9"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-[#dc2626] hover:text-[#dc2626] hover:bg-red-50"
                onClick={() => removeFilter(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addFilter} className="w-full">
            <Plus className="mr-1 h-4 w-4" />
            Add Filter
          </Button>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
