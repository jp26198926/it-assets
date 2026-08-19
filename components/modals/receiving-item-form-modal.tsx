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
import type { ReceivingItem, CreateReceivingItemInput } from "@/lib/types/receiving-item";

interface ReceivingItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ReceivingItem | null;
  receivingId: string;
  itemOptions: { id: string; name: string; uom_name?: string; category_name?: string }[];
  locationOptions: { id: string; name: string }[];
  onSubmit: (data: CreateReceivingItemInput) => Promise<void>;
}

const defaultFormData = {
  item_id: "",
  qty: 0,
  unit_price: 0,
  expiration_date: "",
  remarks: "",
  storage_location_id: "",
};

export function ReceivingItemFormModal({
  open,
  onOpenChange,
  item,
  receivingId,
  itemOptions,
  locationOptions,
  onSubmit,
}: ReceivingItemFormModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        item_id: item.item_id,
        qty: item.qty,
        unit_price: item.unit_price,
        expiration_date: item.expiration_date
          ? new Date(item.expiration_date).toISOString().split("T")[0]
          : "",
        remarks: item.remarks || "",
        storage_location_id: item.storage_location_id || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [item, open]);

  const totalCost = formData.qty * formData.unit_price;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.item_id) newErrors.item_id = "Item is required";
    if (formData.qty <= 0) newErrors.qty = "Quantity must be greater than 0";
    if (!formData.storage_location_id) newErrors.storage_location_id = "Storage Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          receiving_id: receivingId,
          item_id: formData.item_id,
          qty: formData.qty,
          unit_price: formData.unit_price,
          expiration_date: formData.expiration_date
            ? new Date(formData.expiration_date)
            : undefined,
          remarks: formData.remarks || undefined,
          storage_location_id: formData.storage_location_id,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save item" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>{item ? "Edit Receiving Item" : "Add Receiving Item"}</DialogTitle>
          <DialogDescription>
            {item
              ? "Update the item details below."
              : "Fill in the details to add an item."}
          </DialogDescription>
        </DialogHeader>
        <form id="receiving-item-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label htmlFor="item_id">Item *</Label>
            <SearchableSelect
              value={formData.item_id}
              onValueChange={(value) => setFormData({ ...formData, item_id: value })}
              options={itemOptions}
              placeholder="Select item"
              searchPlaceholder="Search items..."
            />
            {formData.item_id && (() => {
              const selectedItem = itemOptions.find((opt) => opt.id === formData.item_id);
              if (selectedItem && (selectedItem.uom_name || selectedItem.category_name)) {
                return (
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    {selectedItem.uom_name && (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">UOM:</span> {selectedItem.uom_name}
                      </span>
                    )}
                    {selectedItem.category_name && (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">Category:</span> {selectedItem.category_name}
                      </span>
                    )}
                  </div>
                );
              }
              return null;
            })()}
            {errors.item_id && (
              <p className="text-xs text-red-500">{errors.item_id}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity *</Label>
              <Input
                id="qty"
                type="number"
                min="0"
                value={formData.qty}
                onChange={(e) =>
                  setFormData({ ...formData, qty: Number(e.target.value) })
                }
                className={errors.qty ? "border-red-500" : ""}
              />
              {errors.qty && (
                <p className="text-xs text-red-500">{errors.qty}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({ ...formData, unit_price: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Total Cost</Label>
            <div className="h-9 flex items-center px-3 bg-muted/50 rounded-md text-sm font-medium">
              {totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storage_location">Storage Location *</Label>
              <SearchableSelect
                value={formData.storage_location_id}
                onValueChange={(value) => setFormData({ ...formData, storage_location_id: value })}
                options={locationOptions}
                placeholder="Select location"
                searchPlaceholder="Search locations..."
              />
              {errors.storage_location_id && (
                <p className="text-xs text-red-500">{errors.storage_location_id}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiration_date: e.target.value })
                }
              />
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
              rows={2}
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
          <Button type="submit" form="receiving-item-form" disabled={loading}>
            {loading ? "Saving..." : item ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
