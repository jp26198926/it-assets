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
import { Checkbox } from "@/components/ui/checkbox";
import { Edit } from "lucide-react";
import type { Meeting, Recurrence } from "@/lib/types/meeting";
import type { MeetingTypeSelectOption } from "@/lib/types/meeting";

interface MeetingEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
  meetingTypes?: MeetingTypeSelectOption[];
  onConfirm: (data: {
    title: string;
    description?: string;
    meeting_type_id?: string;
    platform?: string;
    meeting_link?: string;
    location?: string;
    scheduled_date: Date;
    start_time: string;
    end_time?: string;
    is_recurring: boolean;
    recurrence?: Recurrence | null;
  }) => void;
}

export function MeetingEditModal({
  open,
  onOpenChange,
  meeting,
  meetingTypes = [],
  onConfirm,
}: MeetingEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingTypeId, setMeetingTypeId] = useState("");
  const [platform, setPlatform] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null);

  useEffect(() => {
    if (open && meeting) {
      setTitle(meeting.title);
      setDescription(meeting.description || "");
      setMeetingTypeId(meeting.meeting_type_id || "");
      setPlatform(meeting.platform || "");
      setMeetingLink(meeting.meeting_link || "");
      setLocation(meeting.location || "");
      setScheduledDate(new Date(meeting.scheduled_date).toISOString().split("T")[0]);
      setStartTime(meeting.start_time);
      setEndTime(meeting.end_time || "");
      setIsRecurring(meeting.is_recurring);
      setRecurrence(meeting.recurrence || null);
    }
  }, [open, meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      title,
      description: description || undefined,
      meeting_type_id: meetingTypeId || undefined,
      platform: platform || undefined,
      meeting_link: meetingLink || undefined,
      location: location || undefined,
      scheduled_date: new Date(scheduledDate),
      start_time: startTime,
      end_time: endTime || undefined,
      is_recurring: isRecurring,
      recurrence: isRecurring ? recurrence : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl flex flex-col max-h-[85vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center bg-[#f0f4f8]">
              <Edit className="size-5 text-[#3b82f6]" />
            </div>
            Edit Meeting
          </DialogTitle>
          <DialogDescription>
            Update the meeting details below.
          </DialogDescription>
        </DialogHeader>

        <form id="meeting-edit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meeting Type</Label>
              <Select value={meetingTypeId || "none"} onValueChange={(v) => setMeetingTypeId(v === "none" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {meetingTypes.map((mt) => (
                    <SelectItem key={mt.id} value={mt.id}>
                      {mt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Input
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="Zoom, Google Meet..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Room, building..."
              />
            </div>
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="is_recurring"
              checked={isRecurring}
              onCheckedChange={(checked) => {
                const val = !!checked;
                setIsRecurring(val);
                if (val && !recurrence) {
                  setRecurrence({
                    frequency: "Weekly",
                    interval: 1,
                    end_type: "Never",
                    end_after: null,
                    end_date: null,
                    days_of_week: null,
                  });
                }
              }}
            />
            <Label htmlFor="is_recurring" className="cursor-pointer">
              Recurring meeting
            </Label>
          </div>

          {isRecurring && recurrence && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Frequency</Label>
                  <Select
                    value={recurrence.frequency}
                    onValueChange={(val) =>
                      setRecurrence({ ...recurrence, frequency: val as Recurrence["frequency"] })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Biweekly">Biweekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Every</Label>
                  <Input
                    type="number"
                    min={1}
                    value={recurrence.interval}
                    onChange={(e) =>
                      setRecurrence({ ...recurrence, interval: Number(e.target.value) || 1 })
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ends</Label>
                  <Select
                    value={recurrence.end_type}
                    onValueChange={(val) =>
                      setRecurrence({ ...recurrence, end_type: val as Recurrence["end_type"] })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never">Never</SelectItem>
                      <SelectItem value="After">After N times</SelectItem>
                      <SelectItem value="On Date">On date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {recurrence.end_type === "After" && (
                <div className="space-y-1">
                  <Label className="text-xs">Number of occurrences</Label>
                  <Input
                    type="number"
                    min={1}
                    value={recurrence.end_after || ""}
                    onChange={(e) =>
                      setRecurrence({
                        ...recurrence,
                        end_after: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="h-8 w-32"
                  />
                </div>
              )}
              {recurrence.end_type === "On Date" && (
                <div className="space-y-1">
                  <Label className="text-xs">End date</Label>
                  <Input
                    type="date"
                    value={
                      recurrence.end_date
                        ? new Date(recurrence.end_date).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setRecurrence({
                        ...recurrence,
                        end_date: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    className="h-8 w-48"
                  />
                </div>
              )}
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="meeting-edit-form">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
