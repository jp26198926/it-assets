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
import type { Assignment, MarkAsLostInput } from "@/lib/types/assignment";

interface AssignmentMarkLostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
  onSubmit: (data: MarkAsLostInput) => Promise<void>;
}

const defaultFormData: MarkAsLostInput = {
  date_lost: "",
  lost_reason: "",
};

export function AssignmentMarkLostModal({
  open,
  onOpenChange,
  assignment,
  onSubmit,
}: AssignmentMarkLostModalProps) {
  const [formData, setFormData] = useState<MarkAsLostInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        date_lost: new Date().toISOString().split("T")[0],
        lost_reason: "",
      });
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date_lost) newErrors.date_lost = "Date lost is required";
    if (!formData.lost_reason)
      newErrors.lost_reason = "Lost reason is required";
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
        setErrors({ submit: "Failed to mark as lost" });
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
          <DialogTitle>Mark as Lost</DialogTitle>
          <DialogDescription>
            Record the details for this lost asset.
          </DialogDescription>
        </DialogHeader>
        <form
          id="mark-lost-form"
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto min-h-0"
        >
          {assignment && (
            <div className="rounded-lg bg-muted/30 p-3 text-sm">
              <span className="text-muted-foreground">Asset: </span>
              <span className="font-medium">{assignment.asset_barcode}</span>
              {assignment.item_name && (
                <span className="text-muted-foreground">
                  {" "}
                  — {assignment.item_name}
                </span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date_lost">Date Lost *</Label>
            <Input
              id="date_lost"
              type="date"
              value={formData.date_lost}
              onChange={(e) =>
                setFormData({ ...formData, date_lost: e.target.value })
              }
              className={errors.date_lost ? "border-red-500" : ""}
            />
            {errors.date_lost && (
              <p className="text-xs text-red-500">{errors.date_lost}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lost_reason">Lost Reason *</Label>
            <Textarea
              id="lost_reason"
              value={formData.lost_reason}
              onChange={(e) =>
                setFormData({ ...formData, lost_reason: e.target.value })
              }
              placeholder="Describe why the asset was lost..."
              rows={3}
              className={errors.lost_reason ? "border-red-500" : ""}
            />
            {errors.lost_reason && (
              <p className="text-xs text-red-500">{errors.lost_reason}</p>
            )}
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
          <Button type="submit" form="mark-lost-form" disabled={loading}>
            {loading ? "Saving..." : "Mark as Lost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
