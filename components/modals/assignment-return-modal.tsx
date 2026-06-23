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
import { getAssignmentSelectOptions } from "@/lib/actions/assignment-actions";
import type { Assignment, ReturnAssignmentInput } from "@/lib/types/assignment";

interface AssignmentReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
  onSubmit: (data: ReturnAssignmentInput) => Promise<void>;
}

const defaultFormData: ReturnAssignmentInput = {
  returned_date: "",
  condition_on_return: "",
  location_id: "",
};

export function AssignmentReturnModal({
  open,
  onOpenChange,
  assignment,
  onSubmit,
}: AssignmentReturnModalProps) {
  const [formData, setFormData] = useState<ReturnAssignmentInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      getAssignmentSelectOptions()
        .then((options) => {
          setLocations(options.locations);
        })
        .catch(() => {})
        .finally(() => setOptionsLoading(false));

      setFormData({
        returned_date: new Date().toISOString().split("T")[0],
        condition_on_return: "",
        location_id: assignment?.location_id || "",
      });
      setErrors({});
    }
  }, [open, assignment]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.returned_date)
      newErrors.returned_date = "Returned date is required";
    if (!formData.condition_on_return)
      newErrors.condition_on_return = "Condition on return is required";
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
        setErrors({ submit: "Failed to return assignment" });
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
          <DialogTitle>Return Asset</DialogTitle>
          <DialogDescription>
            Record the return details for this assignment.
          </DialogDescription>
        </DialogHeader>
        <form
          id="return-form"
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto min-h-0"
        >
          {assignment && (
            <div className="rounded-lg bg-muted/30 p-3 text-sm">
              <span className="text-muted-foreground">Asset: </span>
              <span className="font-medium">{assignment.asset_barcode}</span>
              {assignment.item_name && (
                <span className="text-muted-foreground"> — {assignment.item_name}</span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="returned_date">Returned Date *</Label>
            <Input
              id="returned_date"
              type="date"
              value={formData.returned_date}
              onChange={(e) =>
                setFormData({ ...formData, returned_date: e.target.value })
              }
              className={errors.returned_date ? "border-red-500" : ""}
            />
            {errors.returned_date && (
              <p className="text-xs text-red-500">{errors.returned_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition_on_return">Condition on Return *</Label>
            <Input
              id="condition_on_return"
              value={formData.condition_on_return}
              onChange={(e) =>
                setFormData({ ...formData, condition_on_return: e.target.value })
              }
              placeholder="e.g., Good, Excellent, Fair, Damaged"
              className={errors.condition_on_return ? "border-red-500" : ""}
            />
            {errors.condition_on_return && (
              <p className="text-xs text-red-500">
                {errors.condition_on_return}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Returned Location</Label>
            <Select
              value={formData.location_id || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, location_id: value })
              }
              disabled={optionsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button type="submit" form="return-form" disabled={loading}>
            {loading ? "Returning..." : "Return Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
