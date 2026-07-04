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
import type { MeetingType, CreateMeetingTypeInput } from "@/lib/types/meeting-type";

interface MeetingTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingType?: MeetingType | null;
  onSubmit: (data: CreateMeetingTypeInput) => Promise<void>;
}

const defaultFormData: CreateMeetingTypeInput = {
  name: "",
  description: "",
  color: "",
};

export function MeetingTypeFormModal({
  open,
  onOpenChange,
  meetingType,
  onSubmit,
}: MeetingTypeFormModalProps) {
  const [formData, setFormData] = useState<CreateMeetingTypeInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meetingType) {
      setFormData({
        name: meetingType.name,
        description: meetingType.description || "",
        color: meetingType.color || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [meetingType, open]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        description: formData.description || undefined,
        color: formData.color || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>
            {meetingType ? "Edit Meeting Type" : "Add Meeting Type"}
          </DialogTitle>
          <DialogDescription>
            {meetingType
              ? "Update the meeting type details below."
              : "Create a new meeting type category."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="meeting-type-form"
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto min-h-0"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Weekly Standup"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of this meeting type"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="color"
                value={formData.color || "#3b82f6"}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="h-10 w-10 rounded border cursor-pointer"
              />
              <Input
                value={formData.color || ""}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
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
          >
            Cancel
          </Button>
          <Button type="submit" form="meeting-type-form">
            {loading
              ? "Saving..."
              : meetingType
              ? "Save Changes"
              : "Add Meeting Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
