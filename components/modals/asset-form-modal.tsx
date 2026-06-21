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
import { getAssetSelectOptions, generateBarcode } from "@/lib/actions/asset-actions";
import type { Asset, CreateAssetInput } from "@/lib/types/asset";

interface AssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  onSubmit: (data: CreateAssetInput) => Promise<void>;
}

const statuses = ["Available", "Assigned", "Repair", "Lost", "Disposed"] as const;

const defaultFormData: CreateAssetInput = {
  item_id: undefined,
  barcode: "",
  serial_number: "",
  purchase_date: "",
  purchase_price: undefined,
  warranty_expiry: "",
  location_id: undefined,
  assigned_to_employee: undefined,
  assigned_to_department: undefined,
  status: "Available",
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
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      getAssetSelectOptions()
        .then((options) => {
          setItems(options.items);
          setLocations(options.locations);
          setEmployees(options.employees);
          setDepartments(options.departments);
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
        purchase_date: asset.purchase_date
          ? new Date(asset.purchase_date).toISOString().split("T")[0]
          : "",
        purchase_price: asset.purchase_price ?? undefined,
        warranty_expiry: asset.warranty_expiry
          ? new Date(asset.warranty_expiry).toISOString().split("T")[0]
          : "",
        location_id: asset.location_id || undefined,
        assigned_to_employee: asset.assigned_to_employee || undefined,
        assigned_to_department: asset.assigned_to_department || undefined,
        status: asset.status,
      });
    } else {
      generateBarcode()
        .then((barcode) => {
          setFormData((prev) => ({ ...prev, barcode }));
        })
        .catch(() => {});
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [asset, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.barcode) newErrors.barcode = "Barcode is required";
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
          purchase_date: formData.purchase_date || undefined,
          purchase_price: formData.purchase_price || undefined,
          warranty_expiry: formData.warranty_expiry || undefined,
          location_id: formData.location_id || undefined,
          assigned_to_employee: formData.assigned_to_employee || undefined,
          assigned_to_department: formData.assigned_to_department || undefined,
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
        className="max-w-4xl max-h-[85vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
          <DialogDescription>
            {asset
              ? "Update the asset information below."
              : "Fill in the details to add a new asset."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode *</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                placeholder="IT2600001"
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
                <SelectTrigger>
                  <SelectValue placeholder={optionsLoading ? "Loading..." : "Select item"} />
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
                <SelectTrigger>
                  <SelectValue placeholder={optionsLoading ? "Loading..." : "Select location"} />
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
          </div>
          {asset && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assigned_to_employee">Assigned To (Employee)</Label>
                <Select
                  value={formData.assigned_to_employee || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      assigned_to_employee: value === "none" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={optionsLoading ? "Loading..." : "Select employee"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to_department">Assigned To (Department)</Label>
                <Select
                  value={formData.assigned_to_department || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      assigned_to_department: value === "none" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={optionsLoading ? "Loading..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
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
                    purchase_price: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "Available"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as CreateAssetInput["status"],
                  })
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
          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : asset ? "Save Changes" : "Add Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
