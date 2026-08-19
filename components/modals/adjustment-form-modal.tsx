"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getStockLevelByItemAndLocation } from "@/lib/actions/stock-level-actions";
import type { CreateAdjustmentInput } from "@/lib/types/adjustment";

interface AdjustmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAdjustmentInput) => Promise<void>;
}

const defaultFormData = {
  date_adjusted: new Date().toISOString().split("T")[0],
  location_id: "",
  item_id: "",
  qty: "",
  remarks: "",
};

export function AdjustmentFormModal({
  open,
  onOpenChange,
  onSubmit,
}: AdjustmentFormModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<{ id: string; name: string; item_code: string }[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      Promise.all([
        import("@/lib/actions/location-actions").then(({ getLocations }) =>
          getLocations().then((data) =>
            setLocations(data.map((l) => ({ id: l.id, name: l.name })).sort((a, b) => a.name.localeCompare(b.name)))
          )
        ),
        import("@/lib/actions/item-actions").then(({ getItems }) =>
          getItems().then((data) =>
            setItems(data.map((i) => ({ id: i.id, name: i.name, item_code: i.item_code || "" })).sort((a, b) => a.name.localeCompare(b.name)))
          )
        ),
      ])
        .catch(() => {})
        .finally(() => setOptionsLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (formData.location_id && formData.item_id) {
      setStockLoading(true);
      getStockLevelByItemAndLocation(formData.item_id, formData.location_id)
        .then((level) => {
          setCurrentStock(level?.qty ?? 0);
        })
        .catch(() => {
          setCurrentStock(0);
        })
        .finally(() => setStockLoading(false));
    } else {
      setCurrentStock(null);
    }
  }, [formData.location_id, formData.item_id]);

  useEffect(() => {
    if (open) {
      setFormData(defaultFormData);
      setErrors({});
      setCurrentStock(null);
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date_adjusted) newErrors.date_adjusted = "Date adjusted is required";
    if (!formData.location_id) newErrors.location_id = "Location is required";
    if (!formData.item_id) newErrors.item_id = "Item is required";
    if (!formData.qty) newErrors.qty = "Quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          date_adjusted: new Date(formData.date_adjusted),
          location_id: formData.location_id,
          item_id: formData.item_id,
          qty: Number(formData.qty),
          remarks: formData.remarks || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save adjustment" });
      } finally {
        setLoading(false);
      }
    }
  };

  const qty = formData.qty ? Number(formData.qty) : 0;
  const projectedTotal = currentStock !== null ? currentStock + qty : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>Add New Adjustment</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new stock adjustment.
          </DialogDescription>
        </DialogHeader>
        <form id="adjustment-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_adjusted">Date Adjusted *</Label>
              <Input
                id="date_adjusted"
                type="date"
                value={formData.date_adjusted}
                onChange={(e) =>
                  setFormData({ ...formData, date_adjusted: e.target.value })
                }
                className={errors.date_adjusted ? "border-red-500" : ""}
              />
              {errors.date_adjusted && (
                <p className="text-xs text-red-500">{errors.date_adjusted}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <SearchableSelect
                value={formData.location_id}
                onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                options={locations}
                placeholder={optionsLoading ? "Loading..." : "Select location"}
                searchPlaceholder="Search locations..."
              />
              {errors.location_id && (
                <p className="text-xs text-red-500">{errors.location_id}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item *</Label>
              <SearchableSelect
                value={formData.item_id}
                onValueChange={(value) => setFormData({ ...formData, item_id: value })}
                options={items.map((item) => ({ id: item.id, name: `${item.name}${item.item_code ? ` (${item.item_code})` : ""}` }))}
                placeholder={optionsLoading ? "Loading..." : "Select item"}
                searchPlaceholder="Search items..."
              />
              {errors.item_id && (
                <p className="text-xs text-red-500">{errors.item_id}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Current Stock Level</Label>
              <div className="h-10 flex items-center px-3 bg-muted/50 rounded-md text-sm font-medium">
                {stockLoading
                  ? "Loading..."
                  : currentStock !== null
                  ? currentStock
                  : "Select location & item"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity * (positive or negative)</Label>
              <Input
                id="qty"
                type="number"
                value={formData.qty}
                onChange={(e) =>
                  setFormData({ ...formData, qty: e.target.value })
                }
                placeholder="e.g., 10 or -5"
                className={errors.qty ? "border-red-500" : ""}
              />
              {errors.qty && (
                <p className="text-xs text-red-500">{errors.qty}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Projected Stock After Adjustment</Label>
              <div
                className={`h-10 flex items-center px-3 bg-muted/50 rounded-md text-sm font-medium ${
                  projectedTotal !== null && projectedTotal < 0
                    ? "text-red-600"
                    : ""
                }`}
              >
                {projectedTotal !== null ? projectedTotal : "—"}
                {projectedTotal !== null && projectedTotal < 0 && (
                  <span className="ml-2 text-xs text-red-500">(negative)</span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="Optional remarks..."
              rows={3}
              className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="adjustment-form" disabled={loading}>
            {loading ? "Saving..." : "Save Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
