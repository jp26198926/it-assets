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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  MeetingActionItem,
  CreateMeetingActionItemInput,
  UpdateMeetingActionItemInput,
} from "@/lib/types/meeting-action-item";

interface MeetingActionItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MeetingActionItem | null;
  onSubmit: (data: CreateMeetingActionItemInput | UpdateMeetingActionItemInput) => Promise<void>;
  meetings?: { id: string; title: string; meeting_no: number }[];
  employees?: { id: string; name: string }[];
}

const defaultFormData: CreateMeetingActionItemInput = {
  meeting_id: "",
  title: "",
  description: "",
  assigned_to: "",
  due_date: undefined,
  priority: "Medium",
};

export function MeetingActionItemFormModal({
  open,
  onOpenChange,
  item,
  onSubmit,
  meetings = [],
  employees = [],
}: MeetingActionItemFormModalProps) {
  const [formData, setFormData] = useState<CreateMeetingActionItemInput>(defaultFormData);
  const [status, setStatus] = useState<string>("Pending");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        meeting_id: item.meeting_id,
        title: item.title,
        description: item.description || "",
        assigned_to: item.assigned_to || "",
        due_date: item.due_date ? new Date(item.due_date) : undefined,
        priority: item.priority,
      });
      setStatus(item.status);
    } else {
      setFormData(defaultFormData);
      setStatus("Pending");
    }
    setErrors({});
  }, [item, open]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!formData.meeting_id) newErrors.meeting_id = "Meeting is required";
    if (!formData.title) newErrors.title = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (item) {
        await onSubmit({
          ...formData,
          description: formData.description || undefined,
          assigned_to: formData.assigned_to || undefined,
          due_date: formData.due_date || undefined,
          status: status as UpdateMeetingActionItemInput["status"],
        } as UpdateMeetingActionItemInput);
      } else {
        await onSubmit({
          ...formData,
          description: formData.description || undefined,
          assigned_to: formData.assigned_to || undefined,
          due_date: formData.due_date || undefined,
        } as CreateMeetingActionItemInput);
      }
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
            {item ? "Edit Action Item" : "Add Action Item"}
          </DialogTitle>
          <DialogDescription>
            {item
              ? "Update the action item details below."
              : "Create a new action item from a meeting."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="meeting-action-item-form"
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto min-h-0"
        >
          <div className="space-y-2">
            <Label htmlFor="meeting_id">Meeting *</Label>
            <Select
              value={formData.meeting_id}
              onValueChange={(val) =>
                setFormData({ ...formData, meeting_id: val })
              }
            >
              <SelectTrigger id="meeting_id" className="w-full">
                <SelectValue placeholder="Select meeting" />
              </SelectTrigger>
              <SelectContent>
                {meetings.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    #{m.meeting_no} — {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.meeting_id && (
              <p className="text-xs text-red-500">{errors.meeting_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Action item title"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
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
              placeholder="Detailed description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select
                value={formData.assigned_to || ""}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    assigned_to: val === "" ? "" : val,
                  })
                }
              >
                <SelectTrigger id="assigned_to" className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    priority: val as CreateMeetingActionItemInput["priority"],
                  })
                }
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={
                  formData.due_date
                    ? new Date(formData.due_date).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    due_date: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
            {item && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          >
            Cancel
          </Button>
          <Button type="submit" form="meeting-action-item-form">
            {loading
              ? "Saving..."
              : item
              ? "Save Changes"
              : "Add Action Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
