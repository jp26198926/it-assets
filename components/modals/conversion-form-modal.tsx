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
import type { CreateConversionInput } from "@/lib/types/conversion";

interface ConversionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateConversionInput) => Promise<void>;
}

const defaultFormData = {
  date_converted: new Date().toISOString().split("T")[0],
  location_id: "",
  from_item_id: "",
  to_item_id: "",
  from_qty: "",
  to_qty: "",
  remarks: "",
};

export function ConversionFormModal({
  open,
  onOpenChange,
  onSubmit,
}: ConversionFormModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [items, setItems] = useState<
    { id: string; name: string; item_code: string }[]
  >([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [fromStock, setFromStock] = useState<number | null>(null);
  const [toStock, setToStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      Promise.all([
        import("@/lib/actions/location-actions").then(({ getLocations }) =>
          getLocations().then((data) =>
            setLocations(data.map((l) => ({ id: l.id, name: l.name })).sort((a, b) => a.name.localeCompare(b.name))),
          ),
        ),
        import("@/lib/actions/item-actions").then(({ getItems }) =>
          getItems().then((data) =>
            setItems(
              data.map((i) => ({
                id: i.id,
                name: i.name,
                item_code: i.item_code || "",
              })).sort((a, b) => a.name.localeCompare(b.name)),
            ),
          ),
        ),
      ])
        .catch(() => {})
        .finally(() => setOptionsLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (formData.location_id && formData.from_item_id) {
      setStockLoading(true);
      getStockLevelByItemAndLocation(
        formData.from_item_id,
        formData.location_id,
      )
        .then((level) => {
          setFromStock(level?.qty ?? 0);
        })
        .catch(() => {
          setFromStock(0);
        })
        .finally(() => setStockLoading(false));
    } else {
      setFromStock(null);
    }
  }, [formData.location_id, formData.from_item_id]);

  useEffect(() => {
    if (formData.location_id && formData.to_item_id) {
      getStockLevelByItemAndLocation(formData.to_item_id, formData.location_id)
        .then((level) => {
          setToStock(level?.qty ?? 0);
        })
        .catch(() => {
          setToStock(0);
        });
    } else {
      setToStock(null);
    }
  }, [formData.location_id, formData.to_item_id]);

  useEffect(() => {
    if (open) {
      setFormData(defaultFormData);
      setErrors({});
      setFromStock(null);
      setToStock(null);
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date_converted)
      newErrors.date_converted = "Date converted is required";
    if (!formData.location_id) newErrors.location_id = "Location is required";
    if (!formData.from_item_id)
      newErrors.from_item_id = "From item is required";
    if (!formData.to_item_id) newErrors.to_item_id = "To item is required";
    if (
      formData.from_item_id &&
      formData.to_item_id &&
      formData.from_item_id === formData.to_item_id
    ) {
      newErrors.to_item_id = "To item must be different from from item";
    }
    if (!formData.from_qty) newErrors.from_qty = "From quantity is required";
    if (!formData.to_qty) newErrors.to_qty = "To quantity is required";
    if (formData.from_qty && Number(formData.from_qty) <= 0) {
      newErrors.from_qty = "From quantity must be positive";
    }
    if (formData.to_qty && Number(formData.to_qty) <= 0) {
      newErrors.to_qty = "To quantity must be positive";
    }
    if (
      fromStock !== null &&
      formData.from_qty &&
      Number(formData.from_qty) > fromStock
    ) {
      newErrors.from_qty = `Insufficient stock. Available: ${fromStock}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          date_converted: new Date(formData.date_converted),
          location_id: formData.location_id,
          from_item_id: formData.from_item_id,
          to_item_id: formData.to_item_id,
          from_qty: Number(formData.from_qty),
          to_qty: Number(formData.to_qty),
          remarks: formData.remarks || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save conversion" });
      } finally {
        setLoading(false);
      }
    }
  };

  const fromQty = formData.from_qty ? Number(formData.from_qty) : 0;
  const projectedFromStock = fromStock !== null ? fromStock - fromQty : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-7xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>Add New Conversion</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new stock conversion.
          </DialogDescription>
        </DialogHeader>
        <form
          id="conversion-form"
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto min-h-0"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_converted">Date Converted *</Label>
              <Input
                id="date_converted"
                type="date"
                value={formData.date_converted}
                onChange={(e) =>
                  setFormData({ ...formData, date_converted: e.target.value })
                }
                className={errors.date_converted ? "border-red-500" : ""}
              />
              {errors.date_converted && (
                <p className="text-xs text-red-500">{errors.date_converted}</p>
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
              <Label htmlFor="from_item">From Item *</Label>
              <SearchableSelect
                value={formData.from_item_id}
                onValueChange={(value) => setFormData({ ...formData, from_item_id: value })}
                options={items.map((item) => ({ id: item.id, name: `${item.name}${item.item_code ? ` (${item.item_code})` : ""}` }))}
                placeholder={optionsLoading ? "Loading..." : "Select from item"}
                searchPlaceholder="Search items..."
              />
              {errors.from_item_id && (
                <p className="text-xs text-red-500">{errors.from_item_id}</p>
              )}
              {formData.location_id && formData.from_item_id && (
                <p className="text-xs text-muted-foreground">
                  Current stock:{" "}
                  <span className="font-medium text-foreground">
                    {stockLoading ? "Loading..." : (fromStock ?? 0)}
                  </span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_item">To Item *</Label>
              <SearchableSelect
                value={formData.to_item_id}
                onValueChange={(value) => setFormData({ ...formData, to_item_id: value })}
                options={items.map((item) => ({ id: item.id, name: `${item.name}${item.item_code ? ` (${item.item_code})` : ""}` }))}
                placeholder={optionsLoading ? "Loading..." : "Select to item"}
                searchPlaceholder="Search items..."
              />
              {errors.to_item_id && (
                <p className="text-xs text-red-500">{errors.to_item_id}</p>
              )}
              {formData.location_id && formData.to_item_id && (
                <p className="text-xs text-muted-foreground">
                  Current stock:{" "}
                  <span className="font-medium text-foreground">
                    {toStock ?? 0}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_qty">From Quantity *</Label>
              <Input
                id="from_qty"
                type="number"
                value={formData.from_qty}
                onChange={(e) =>
                  setFormData({ ...formData, from_qty: e.target.value })
                }
                placeholder="Quantity to deduct"
                min="1"
                className={errors.from_qty ? "border-red-500" : ""}
              />
              {errors.from_qty && (
                <p className="text-xs text-red-500">{errors.from_qty}</p>
              )}
              {projectedFromStock !== null && (
                <p
                  className={`text-xs ${projectedFromStock < 0 ? "text-red-500" : "text-muted-foreground"}`}
                >
                  Projected stock:{" "}
                  <span
                    className={`font-medium ${projectedFromStock < 0 ? "text-red-600" : "text-foreground"}`}
                  >
                    {projectedFromStock}
                  </span>
                  {projectedFromStock < 0 && (
                    <span className="ml-1">(negative)</span>
                  )}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_qty">To Quantity *</Label>
              <Input
                id="to_qty"
                type="number"
                value={formData.to_qty}
                onChange={(e) =>
                  setFormData({ ...formData, to_qty: e.target.value })
                }
                placeholder="Quantity to add"
                min="1"
                className={errors.to_qty ? "border-red-500" : ""}
              />
              {errors.to_qty && (
                <p className="text-xs text-red-500">{errors.to_qty}</p>
              )}
              {toStock !== null && formData.to_qty && (
                <p className="text-xs text-muted-foreground">
                  Projected stock:{" "}
                  <span className="font-medium text-foreground">
                    {toStock + Number(formData.to_qty)}
                  </span>
                </p>
              )}
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
          <Button type="submit" form="conversion-form" disabled={loading}>
            {loading ? "Saving..." : "Save Conversion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
