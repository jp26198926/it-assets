"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ITAsset, AdvancedFilter } from "@/lib/types";

interface AdvancedFilterDialogProps {
  filters: AdvancedFilter[];
  onFiltersChange: (filters: AdvancedFilter[]) => void;
}

const filterFields: { value: keyof ITAsset; label: string }[] = [
  { value: "assetTag", label: "Asset Tag" },
  { value: "name", label: "Name" },
  { value: "type", label: "Type" },
  { value: "brand", label: "Brand" },
  { value: "model", label: "Model" },
  { value: "status", label: "Status" },
  { value: "assignedTo", label: "Assigned To" },
  { value: "location", label: "Location" },
  { value: "department", label: "Department" },
  { value: "purchaseCost", label: "Purchase Cost" },
];

const operators: { value: AdvancedFilter["operator"]; label: string }[] = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "greaterThan", label: "Greater than" },
  { value: "lessThan", label: "Less than" },
  { value: "startsWith", label: "Starts with" },
];

export function AdvancedFilterDialog({
  filters,
  onFiltersChange,
}: AdvancedFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AdvancedFilter[]>(filters);

  const addFilter = () => {
    setLocalFilters([
      ...localFilters,
      { field: "name", operator: "contains", value: "" },
    ]);
  };

  const removeFilter = (index: number) => {
    setLocalFilters(localFilters.filter((_, i) => i !== index));
  };

  const updateFilter = (
    index: number,
    key: keyof AdvancedFilter,
    value: string
  ) => {
    const updated = [...localFilters];
    updated[index] = { ...updated[index], [key]: value };
    setLocalFilters(updated);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters.filter((f) => f.value !== ""));
    setOpen(false);
  };

  const clearAll = () => {
    setLocalFilters([]);
    onFiltersChange([]);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) setLocalFilters(filters);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Plus className="mr-1 h-4 w-4" />
          Advanced Filter
          {filters.length > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {filters.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Advanced Filter</DialogTitle>
          <DialogDescription>
            Add multiple filter conditions. All conditions are combined with AND logic.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {localFilters.map((filter, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">Field</Label>
                <Select
                  value={filter.field}
                  onValueChange={(value) =>
                    updateFilter(index, "field", value)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs">Operator</Label>
                <Select
                  value={filter.operator}
                  onValueChange={(value) =>
                    updateFilter(index, "operator", value)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs">Value</Label>
                <Input
                  value={filter.value}
                  onChange={(e) =>
                    updateFilter(index, "value", e.target.value)
                  }
                  className="h-9"
                  placeholder="Enter value..."
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => removeFilter(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {localFilters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No filter conditions added. Click &quot;Add Condition&quot; to start filtering.
            </p>
          )}
        </div>
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
            <Button variant="outline" onClick={addFilter}>
              <Plus className="mr-1 h-4 w-4" />
              Add Condition
            </Button>
          </div>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
