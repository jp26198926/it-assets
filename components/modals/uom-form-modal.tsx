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
import type { UOM, CreateUOMInput } from "@/lib/types/uom";

interface UOMFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uom?: UOM | null;
  onSubmit: (data: CreateUOMInput) => Promise<void>;
}

const defaultFormData: CreateUOMInput = {
  code: "",
  name: "",
};

export function UOMFormModal({
  open,
  onOpenChange,
  uom,
  onSubmit,
}: UOMFormModalProps) {
  const [formData, setFormData] = useState<CreateUOMInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (uom) {
      setFormData({
        code: uom.code,
        name: uom.name,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [uom, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code) newErrors.code = "Code is required";
    if (!formData.name) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit(formData);
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save UOM" });
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
        <DialogHeader>
          <DialogTitle>{uom ? "Edit UOM" : "Add New UOM"}</DialogTitle>
          <DialogDescription>
            {uom
              ? "Update the UOM information below."
              : "Fill in the details to add a new UOM."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="e.g., KG, LTR, PCS"
              className={errors.code ? "border-red-500" : ""}
            />
            {errors.code && (
              <p className="text-xs text-red-500">{errors.code}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Kilogram, Liter, Piece"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
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
              {loading ? "Saving..." : uom ? "Save Changes" : "Add UOM"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
