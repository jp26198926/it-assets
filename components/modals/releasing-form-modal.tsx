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
import type { Releasing, CreateReleasingInput } from "@/lib/types/releasing";

interface ReleasingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  releasing?: Releasing | null;
  onSubmit: (data: CreateReleasingInput) => Promise<void>;
}

const defaultFormData = {
  date_released: new Date().toISOString().split("T")[0],
  from_location_id: "",
  to_department_id: "",
  remarks: "",
};

export function ReleasingFormModal({
  open,
  onOpenChange,
  releasing,
  onSubmit,
}: ReleasingFormModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open) {
      Promise.all([
        import("@/lib/actions/location-actions").then(({ getLocations }) => getLocations()),
        import("@/lib/actions/department-actions").then(({ getDepartments }) => getDepartments()),
      ]).then(([locs, depts]) => {
        setLocations(locs.map((l: { id: string; name: string }) => ({ id: l.id, name: l.name })));
        setDepartments(depts.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })));
      }).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (releasing) {
      setFormData({
        date_released: new Date(releasing.date_released).toISOString().split("T")[0],
        from_location_id: releasing.from_location_id || "",
        to_department_id: releasing.to_department_id || "",
        remarks: releasing.remarks || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [releasing, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date_released) newErrors.date_released = "Date released is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          date_released: new Date(formData.date_released),
          from_location_id: formData.from_location_id || undefined,
          to_department_id: formData.to_department_id || undefined,
          remarks: formData.remarks || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save releasing" });
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
          <DialogTitle>{releasing ? "Edit Releasing" : "Add New Releasing"}</DialogTitle>
          <DialogDescription>
            {releasing
              ? "Update the releasing information below."
              : "Fill in the details to add a new releasing."}
          </DialogDescription>
        </DialogHeader>
        <form id="releasing-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          {releasing && (
            <div className="space-y-2">
              <Label>Code: {releasing.code}</Label>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_released">Date Released *</Label>
              <Input
                id="date_released"
                type="date"
                value={formData.date_released}
                onChange={(e) =>
                  setFormData({ ...formData, date_released: e.target.value })
                }
                className={errors.date_released ? "border-red-500" : ""}
              />
              {errors.date_released && (
                <p className="text-xs text-red-500">{errors.date_released}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>From Location</Label>
              <Select
                value={formData.from_location_id || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    from_location_id: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Location</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>To Department</Label>
            <Select
              value={formData.to_department_id || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  to_department_id: value === "none" ? "" : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Department</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button type="submit" form="releasing-form" disabled={loading}>
            {loading ? "Saving..." : releasing ? "Save Changes" : "Add Releasing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
