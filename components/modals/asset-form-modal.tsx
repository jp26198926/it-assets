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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAssetSelectOptions } from "@/lib/actions/asset-actions";
import type { Asset, CreateAssetInput } from "@/lib/types/asset";

interface AssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  onSubmit: (data: CreateAssetInput) => Promise<void>;
}

const defaultFormData: CreateAssetInput = {
  item_id: undefined,
  barcode: "",
  serial_number: "",
  remarks: "",
  date_received: "",
  purchase_date: "",
  purchase_price: undefined,
  warranty_expiry: "",
  location_id: undefined,

};

export function AssetFormModal({
  open,
  onOpenChange,
  asset,
  onSubmit,
}: AssetFormModalProps) {
  const [formData, setFormData] = useState<CreateAssetInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(
    [],
  );

  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      getAssetSelectOptions()
        .then((options) => {
          setItems(options.items);
          setLocations(options.locations);

        })
        .catch(() => {})
        .finally(() => setOptionsLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (asset) {
      setFormData({
        item_id: asset.item_id || undefined,
        barcode: asset.barcode,
        serial_number: asset.serial_number || "",
        remarks: asset.remarks || "",
        date_received: asset.date_received
          ? new Date(asset.date_received).toISOString().split("T")[0]
          : "",
        purchase_date: asset.purchase_date
          ? new Date(asset.purchase_date).toISOString().split("T")[0]
          : "",
        purchase_price: asset.purchase_price ?? undefined,
        warranty_expiry: asset.warranty_expiry
          ? new Date(asset.warranty_expiry).toISOString().split("T")[0]
          : "",
        location_id: asset.location_id || undefined,

      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [asset, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (asset && !formData.barcode) newErrors.barcode = "Barcode is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          ...formData,
          item_id: formData.item_id || undefined,
          serial_number: formData.serial_number || undefined,
          remarks: formData.remarks || undefined,
          date_received: formData.date_received || undefined,
          purchase_date: formData.purchase_date || undefined,
          purchase_price: formData.purchase_price || undefined,
          warranty_expiry: formData.warranty_expiry || undefined,
          location_id: formData.location_id || undefined,

        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save asset" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl sm:max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>{asset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
          <DialogDescription>
            {asset
              ? "Update the asset information below."
              : "Fill in the details to add a new asset."}
          </DialogDescription>
        </DialogHeader>
        <form
          id="asset-form"
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto min-h-0"
        >
          <div className="space-y-2">
            <Label htmlFor="item_id">Item</Label>
            <Select
              value={formData.item_id || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  item_id: value === "none" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={optionsLoading ? "Loading..." : "Select item"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Item</SelectItem>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode {!asset && "*"}</Label>
              <Input
                id="barcode"
                value={asset ? formData.barcode : ""}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                disabled
                placeholder={asset ? "IT2600001" : "Auto-generated"}
                className={errors.barcode ? "border-red-500" : ""}
              />
              {errors.barcode && (
                <p className="text-xs text-red-500">{errors.barcode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                value={formData.serial_number || ""}
                onChange={(e) =>
                  setFormData({ ...formData, serial_number: e.target.value })
                }
                placeholder="e.g., SN-12345678"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_id">Location</Label>
              <Select
                value={formData.location_id || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    location_id: value === "none" ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      optionsLoading ? "Loading..." : "Select location"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Location</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_received">Date Received</Label>
              <Input
                id="date_received"
                type="date"
                value={formData.date_received || ""}
                onChange={(e) =>
                  setFormData({ ...formData, date_received: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
              <Input
                id="warranty_expiry"
                type="date"
                value={formData.warranty_expiry || ""}
                onChange={(e) =>
                  setFormData({ ...formData, warranty_expiry: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                id="purchase_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchase_price ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchase_price: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks || ""}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="Additional notes or remarks..."
              rows={3}
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
          <Button type="submit" form="asset-form" disabled={loading}>
            {loading ? "Saving..." : asset ? "Save Changes" : "Add Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
