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
import type { TicketCategory, CreateTicketCategoryInput } from "@/lib/types/ticket-category";

interface TicketCategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketCategory?: TicketCategory | null;
  onSubmit: (data: CreateTicketCategoryInput) => Promise<void>;
}

const defaultFormData: CreateTicketCategoryInput = {
  name: "",
};

export function TicketCategoryFormModal({
  open,
  onOpenChange,
  ticketCategory,
  onSubmit,
}: TicketCategoryFormModalProps) {
  const [formData, setFormData] = useState<CreateTicketCategoryInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticketCategory) {
      setFormData({
        name: ticketCategory.name,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [ticketCategory, open]);

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
        await onSubmit(formData);
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save ticket category" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>{ticketCategory ? "Edit Ticket Category" : "Add New Ticket Category"}</DialogTitle>
          <DialogDescription>
            {ticketCategory
              ? "Update the ticket category information below."
              : "Fill in the details to add a new ticket category."}
          </DialogDescription>
        </DialogHeader>
        <form id="ticket-category-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Hardware Issue, Software Bug"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
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
          <Button type="submit" form="ticket-category-form" disabled={loading}>
            {loading ? "Saving..." : ticketCategory ? "Save Changes" : "Add Ticket Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
