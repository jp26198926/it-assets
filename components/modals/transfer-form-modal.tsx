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
import type { Transfer, CreateTransferInput } from "@/lib/types/transfer";

interface TransferFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer?: Transfer | null;
  onSubmit: (data: CreateTransferInput) => Promise<void>;
}

const defaultFormData = {
  date_transferred: new Date().toISOString().split("T")[0],
  from_location_id: "",
  to_location_id: "",
  remarks: "",
};

export function TransferFormModal({
  open,
  onOpenChange,
  transfer,
  onSubmit,
}: TransferFormModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      import("@/lib/actions/location-actions").then(({ getLocations }) => {
        getLocations().then((data) => {
          setLocations(data.map((l: { id: string; name: string }) => ({ id: l.id, name: l.name })).sort((a, b) => a.name.localeCompare(b.name)));
        });
      }).catch(() => {}).finally(() => setOptionsLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (transfer) {
      setFormData({
        date_transferred: new Date(transfer.date_transferred).toISOString().split("T")[0],
        from_location_id: transfer.from_location_id || "",
        to_location_id: transfer.to_location_id || "",
        remarks: transfer.remarks || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [transfer, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date_transferred) newErrors.date_transferred = "Date transferred is required";
    if (!formData.from_location_id) newErrors.from_location_id = "From location is required";
    if (!formData.to_location_id) newErrors.to_location_id = "To location is required";
    if (formData.from_location_id && formData.from_location_id === formData.to_location_id) {
      newErrors.to_location_id = "To location must be different from From location";
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
          date_transferred: new Date(formData.date_transferred),
          from_location_id: formData.from_location_id,
          to_location_id: formData.to_location_id,
          remarks: formData.remarks || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save transfer" });
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
          <DialogTitle>{transfer ? "Edit Transfer" : "Add New Transfer"}</DialogTitle>
          <DialogDescription>
            {transfer
              ? "Update the transfer information below."
              : "Fill in the details to add a new transfer."}
          </DialogDescription>
        </DialogHeader>
        <form id="transfer-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          {transfer && (
            <div className="space-y-2">
              <Label>Code: {transfer.code}</Label>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_transferred">Date Transferred *</Label>
              <Input
                id="date_transferred"
                type="date"
                value={formData.date_transferred}
                onChange={(e) =>
                  setFormData({ ...formData, date_transferred: e.target.value })
                }
                className={errors.date_transferred ? "border-red-500" : ""}
              />
              {errors.date_transferred && (
                <p className="text-xs text-red-500">{errors.date_transferred}</p>
              )}
            </div>
            <div />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_location">From Location *</Label>
              <SearchableSelect
                value={formData.from_location_id}
                onValueChange={(value) => setFormData({ ...formData, from_location_id: value })}
                options={locations}
                placeholder={optionsLoading ? "Loading..." : "Select location"}
                searchPlaceholder="Search locations..."
              />
              {errors.from_location_id && (
                <p className="text-xs text-red-500">{errors.from_location_id}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_location">To Location *</Label>
              <SearchableSelect
                value={formData.to_location_id}
                onValueChange={(value) => setFormData({ ...formData, to_location_id: value })}
                options={locations}
                placeholder={optionsLoading ? "Loading..." : "Select location"}
                searchPlaceholder="Search locations..."
              />
              {errors.to_location_id && (
                <p className="text-xs text-red-500">{errors.to_location_id}</p>
              )}
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
          <Button type="submit" form="transfer-form" disabled={loading}>
            {loading ? "Saving..." : transfer ? "Save Changes" : "Add Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
