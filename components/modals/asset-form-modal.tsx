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
import type { ITAsset, AssetStatus, AssetType } from "@/lib/types";

interface AssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: ITAsset | null;
  onSubmit: (data: Omit<ITAsset, "id" | "isDeleted">) => void;
}

const assetTypes: AssetType[] = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Server",
  "Printer",
  "Network Device",
];

const statuses: AssetStatus[] = [
  "Active",
  "In Use",
  "Maintenance",
  "Retired",
  "Available",
];

const defaultFormData = {
  assetTag: "",
  name: "",
  type: "Laptop" as AssetType,
  brand: "",
  model: "",
  serialNumber: "",
  status: "Active" as AssetStatus,
  assignedTo: "",
  location: "",
  department: "",
  purchaseDate: "",
  warrantyExpiry: "",
  purchaseCost: 0,
  notes: "",
};

export function AssetFormModal({
  open,
  onOpenChange,
  asset,
  onSubmit,
}: AssetFormModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (asset) {
      setFormData({
        assetTag: asset.assetTag,
        name: asset.name,
        type: asset.type,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        status: asset.status,
        assignedTo: asset.assignedTo || "",
        location: asset.location,
        department: asset.department,
        purchaseDate: asset.purchaseDate,
        warrantyExpiry: asset.warrantyExpiry,
        purchaseCost: asset.purchaseCost,
        notes: asset.notes,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [asset, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.model) newErrors.model = "Model is required";
    if (!formData.serialNumber)
      newErrors.serialNumber = "Serial number is required";
    if (!formData.location) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        assignedTo: formData.assignedTo || null,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
          <DialogDescription>
            {asset
              ? "Update the asset information below."
              : "Fill in the details to add a new IT asset."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetTag">Asset Tag</Label>
              <Input
                id="assetTag"
                value={formData.assetTag}
                onChange={(e) =>
                  setFormData({ ...formData, assetTag: e.target.value })
                }
                placeholder="Auto-generated"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Dell Latitude 5540"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as AssetType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as AssetStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                placeholder="e.g., Dell, HP"
                className={errors.brand ? "border-red-500" : ""}
              />
              {errors.brand && (
                <p className="text-xs text-red-500">{errors.brand}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                placeholder="e.g., Latitude 5540"
                className={errors.model ? "border-red-500" : ""}
              />
              {errors.model && (
                <p className="text-xs text-red-500">{errors.model}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number *</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) =>
                setFormData({ ...formData, serialNumber: e.target.value })
              }
              placeholder="e.g., DL-5540-8A3F2B"
              className={errors.serialNumber ? "border-red-500" : ""}
            />
            {errors.serialNumber && (
              <p className="text-xs text-red-500">{errors.serialNumber}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                placeholder="Person name (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Main Office - Floor 1"
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-xs text-red-500">{errors.location}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              placeholder="e.g., IT, Engineering"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
              <Input
                id="warrantyExpiry"
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) =>
                  setFormData({ ...formData, warrantyExpiry: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseCost">Cost ($)</Label>
              <Input
                id="purchaseCost"
                type="number"
                value={formData.purchaseCost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchaseCost: Number(e.target.value),
                  })
                }
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {asset ? "Save Changes" : "Add Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
