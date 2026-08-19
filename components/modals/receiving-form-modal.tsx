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
import { getItemSelectOptions } from "@/lib/actions/item-actions";
import type { Receiving, CreateReceivingInput } from "@/lib/types/receiving";

interface ReceivingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiving?: Receiving | null;
  onSubmit: (data: CreateReceivingInput) => Promise<void>;
}

const defaultFormData = {
  date_received: new Date().toISOString().split("T")[0],
  supplier_id: "",
  po_number: "",
  invoice_number: "",
  remarks: "",
};

export function ReceivingFormModal({
  open,
  onOpenChange,
  receiving,
  onSubmit,
}: ReceivingFormModalProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      // Load suppliers for dropdown
      import("@/lib/actions/supplier-actions").then(({ getSuppliers }) => {
        getSuppliers().then((data) => {
          setSuppliers(data.map((s) => ({ id: s.id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name)));
        });
      }).catch(() => {}).finally(() => setOptionsLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (receiving) {
      setFormData({
        date_received: new Date(receiving.date_received).toISOString().split("T")[0],
        supplier_id: receiving.supplier_id || "",
        po_number: receiving.po_number || "",
        invoice_number: receiving.invoice_number || "",
        remarks: receiving.remarks || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [receiving, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date_received) newErrors.date_received = "Date received is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          date_received: new Date(formData.date_received),
          supplier_id: formData.supplier_id || undefined,
          po_number: formData.po_number || undefined,
          invoice_number: formData.invoice_number || undefined,
          remarks: formData.remarks || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save receiving" });
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
          <DialogTitle>{receiving ? "Edit Receiving" : "Add New Receiving"}</DialogTitle>
          <DialogDescription>
            {receiving
              ? "Update the receiving information below."
              : "Fill in the details to add a new receiving."}
          </DialogDescription>
        </DialogHeader>
        <form id="receiving-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          {receiving && (
            <div className="space-y-2">
              <Label>Code: {receiving.code}</Label>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_received">Date Received *</Label>
              <Input
                id="date_received"
                type="date"
                value={formData.date_received}
                onChange={(e) =>
                  setFormData({ ...formData, date_received: e.target.value })
                }
                className={errors.date_received ? "border-red-500" : ""}
              />
              {errors.date_received && (
                <p className="text-xs text-red-500">{errors.date_received}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <SearchableSelect
                value={formData.supplier_id}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                options={suppliers}
                placeholder={optionsLoading ? "Loading..." : "Select supplier"}
                searchPlaceholder="Search suppliers..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="po_number">PO Number</Label>
              <Input
                id="po_number"
                value={formData.po_number}
                onChange={(e) =>
                  setFormData({ ...formData, po_number: e.target.value })
                }
                placeholder="e.g., PO-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_number: e.target.value })
                }
                placeholder="e.g., INV-001"
              />
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
          <Button type="submit" form="receiving-form" disabled={loading}>
            {loading ? "Saving..." : receiving ? "Save Changes" : "Add Receiving"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
