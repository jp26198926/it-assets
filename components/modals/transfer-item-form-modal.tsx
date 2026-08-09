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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransferItem, CreateTransferItemInput } from "@/lib/types/transfer-item";

interface TransferItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: TransferItem | null;
  transferId: string;
  fromLocationId: string;
  itemOptions: { id: string; name: string; uom_name?: string; category_name?: string }[];
  onSubmit: (data: CreateTransferItemInput) => Promise<void>;
}

const defaultFormData = {
  item_id: "",
  qty: 0,
  remarks: "",
};

export function TransferItemFormModal({
  open,
  onOpenChange,
  item,
  transferId,
  fromLocationId,
  itemOptions,
  onSubmit,
}: TransferItemFormModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        item_id: item.item_id,
        qty: item.qty,
        remarks: item.remarks || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
    setAvailableStock(null);
  }, [item, open]);

  // Fetch available stock when item or fromLocationId changes
  useEffect(() => {
    if (!formData.item_id || !fromLocationId) {
      setAvailableStock(null);
      return;
    }

    let cancelled = false;
    setStockLoading(true);

    import("@/lib/actions/stock-level-actions").then(({ getStockLevelByItemAndLocation }) => {
      getStockLevelByItemAndLocation(formData.item_id, fromLocationId)
        .then((level) => {
          if (!cancelled) {
            setAvailableStock(level?.qty ?? 0);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setAvailableStock(0);
          }
        })
        .finally(() => {
          if (!cancelled) setStockLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [formData.item_id, fromLocationId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.item_id) newErrors.item_id = "Item is required";
    if (formData.qty <= 0) newErrors.qty = "Quantity must be greater than 0";
    if (availableStock !== null && formData.qty > availableStock) {
      newErrors.qty = `Insufficient stock. Available: ${availableStock}`;
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
          transfer_id: transferId,
          item_id: formData.item_id,
          qty: formData.qty,
          remarks: formData.remarks || undefined,
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
          <DialogTitle>{item ? "Edit Transfer Item" : "Add Transfer Item"}</DialogTitle>
          <DialogDescription>
            {item
              ? "Update the item details below."
              : "Fill in the details to add an item."}
          </DialogDescription>
        </DialogHeader>
        <form id="transfer-item-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label htmlFor="item_id">Item *</Label>
            <Select
              value={formData.item_id || "none"}
              onValueChange={(value) =>
                setFormData({ ...formData, item_id: value === "none" ? "" : value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Item</SelectItem>
                {itemOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {formData.item_id && fromLocationId && (
              <div className="flex items-center gap-2 text-xs">
                {stockLoading ? (
                  <span className="text-[#64748b]">Loading stock...</span>
                ) : (
                  <span className={`font-medium ${availableStock !== null && availableStock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    Available stock: {availableStock ?? 0}
                  </span>
                )}
              </div>
            )}
            {errors.item_id && (
              <p className="text-xs text-red-500">{errors.item_id}</p>
            )}
          </div>
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
          <Button type="submit" form="transfer-item-form" disabled={loading}>
            {loading ? "Saving..." : item ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
