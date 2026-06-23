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
import type { Permission, CreatePermissionInput } from "@/lib/types/permission";

interface PermissionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission?: Permission | null;
  onSubmit: (data: CreatePermissionInput) => Promise<void>;
}

const defaultFormData: CreatePermissionInput = {
  name: "",
  description: "",
};

export function PermissionFormModal({
  open,
  onOpenChange,
  permission,
  onSubmit,
}: PermissionFormModalProps) {
  const [formData, setFormData] = useState<CreatePermissionInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [permission, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
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
          description: formData.description || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save permission" });
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
          <DialogTitle>{permission ? "Edit Permission" : "Add New Permission"}</DialogTitle>
          <DialogDescription>
            {permission
              ? "Update the permission information below."
              : "Fill in the details to add a new permission."}
          </DialogDescription>
        </DialogHeader>
        <form id="permission-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Read Access"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of this permission..."
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
          <Button type="submit" form="permission-form" disabled={loading}>
            {loading ? "Saving..." : permission ? "Save Changes" : "Add Permission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
