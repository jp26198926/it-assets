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
import { Copy } from "lucide-react";
import type { Meeting } from "@/lib/types/meeting";

interface MeetingCloneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
  onConfirm: (data: { scheduled_date: Date; start_time: string; end_time?: string }) => void;
  loading: boolean;
}

export function MeetingCloneModal({
  open,
  onOpenChange,
  meeting,
  onConfirm,
  loading,
}: MeetingCloneModalProps) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (open && meeting) {
      setScheduledDate(new Date(meeting.scheduled_date).toISOString().split("T")[0]);
      setStartTime(meeting.start_time);
      setEndTime(meeting.end_time || "");
    }
  }, [open, meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      scheduled_date: new Date(scheduledDate),
      start_time: startTime,
      end_time: endTime || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Clone Meeting
          </DialogTitle>
          <DialogDescription>
            Create a copy of &quot;{meeting?.title}&quot; with a new schedule. Minutes and action items will not be copied.
          </DialogDescription>
        </DialogHeader>

        <form id="meeting-clone-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="meeting-clone-form" disabled={loading}>
            {loading ? "Cloning..." : "Clone Meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
