"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Upload, X, FileText } from "lucide-react";
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
import { toast } from "sonner";
import type {
  Meeting,
  CreateMeetingInput,
  AgendaItem,
  Attendee,
  Recurrence,
} from "@/lib/types/meeting";
import type { MeetingTypeSelectOption } from "@/lib/types/meeting";
import type { EmployeeSelectOption } from "@/lib/types/employee";
import { getCloudinarySettings } from "@/lib/actions/cloudinary-actions";

interface MeetingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: Meeting | null;
  onSubmit: (data: CreateMeetingInput) => Promise<void>;
  meetingTypes?: MeetingTypeSelectOption[];
  employees?: EmployeeSelectOption[];
}

const defaultFormData: CreateMeetingInput = {
  title: "",
  description: "",
  meeting_type_id: "",
  scheduled_date: new Date(),
  start_time: "09:00",
  end_time: "",
  location: "",
  meeting_link: "",
  platform: "",
  notes: "",
  agenda_items: [],
  attendees: [],
  attachments: [],
  is_recurring: false,
  recurrence: null,
};

export function MeetingFormModal({
  open,
  onOpenChange,
  meeting,
  onSubmit,
  meetingTypes = [],
  employees = [],
}: MeetingFormModalProps) {
  const [formData, setFormData] = useState<CreateMeetingInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState(10);

  useEffect(() => {
    getCloudinarySettings().then((s) => setMaxFileSize(s.max_file_size || 10));
  }, []);

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        description: meeting.description || "",
        meeting_type_id: meeting.meeting_type_id || "",
        scheduled_date: new Date(meeting.scheduled_date),
        start_time: meeting.start_time,
        end_time: meeting.end_time || "",
        location: meeting.location || "",
        meeting_link: meeting.meeting_link || "",
        platform: meeting.platform || "",
        notes: meeting.notes || "",
        agenda_items: meeting.agenda_items.map((a) => ({
          topic: a.topic,
          description: a.description,
          presenter: a.presenter,
          duration_minutes: a.duration_minutes,
          notes: a.notes,
        })),
        attendees: meeting.attendees.map((a) => ({
          employee_id: a.employee_id,
          attendance_status: a.attendance_status,
          notes: a.notes,
        })),
        attachments: meeting.attachments || [],
        is_recurring: meeting.is_recurring,
        recurrence: meeting.recurrence,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
    setPendingFiles([]);
  }, [meeting, open]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.start_time) newErrors.start_time = "Start time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const uploadedUrls = await uploadPendingFiles();
      const allAttachments = [...(formData.attachments || []), ...uploadedUrls];

      await onSubmit({
        ...formData,
        attachments: allAttachments,
        description: formData.description || undefined,
        meeting_type_id: formData.meeting_type_id || undefined,
        end_time: formData.end_time || undefined,
        location: formData.location || undefined,
        meeting_link: formData.meeting_link || undefined,
        platform: formData.platform || undefined,
        notes: formData.notes || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      setLoading(false);
    }
  }

  function addAgendaItem() {
    setFormData({
      ...formData,
      agenda_items: [
        ...(formData.agenda_items || []),
        { topic: "", description: null, presenter: null, duration_minutes: null, notes: null },
      ],
    });
  }

  function removeAgendaItem(index: number) {
    const items = [...(formData.agenda_items || [])];
    items.splice(index, 1);
    setFormData({ ...formData, agenda_items: items });
  }

  function updateAgendaItem(index: number, field: string, value: unknown) {
    const items = [...(formData.agenda_items || [])];
    (items[index] as Record<string, unknown>)[field] = value;
    setFormData({ ...formData, agenda_items: items });
  }

  function addAttendee() {
    setFormData({
      ...formData,
      attendees: [
        ...(formData.attendees || []),
        { employee_id: "", attendance_status: "Pending" as const, notes: null },
      ],
    });
  }

  function removeAttendee(index: number) {
    const items = [...(formData.attendees || [])];
    items.splice(index, 1);
    setFormData({ ...formData, attendees: items });
  }

  function updateAttendee(index: number, field: string, value: unknown) {
    const items = [...(formData.attendees || [])];
    (items[index] as Record<string, unknown>)[field] = value;
    setFormData({ ...formData, attendees: items });
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxBytes = maxFileSize * 1024 * 1024;
    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > maxBytes) {
        toast.error(`"${file.name}" exceeds the ${maxFileSize} MB limit.`);
        continue;
      }
      valid.push(file);
    }
    setPendingFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: (formData.attachments || []).filter((_, i) => i !== index),
    });
  };

  const uploadPendingFiles = async (): Promise<string[]> => {
    if (pendingFiles.length === 0) return [];
    setUploadingFiles(true);
    const urls: string[] = [];
    for (const file of pendingFiles) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("fileName", file.name);
      const res = await fetch("/api/meetings/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.url) {
        urls.push(data.url);
      } else {
        toast.error(data.error || `Failed to upload ${file.name}`);
      }
    }
    setUploadingFiles(false);
    return urls;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl sm:max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>
            {meeting ? "Edit Meeting" : "Create Meeting"}
          </DialogTitle>
          <DialogDescription>
            {meeting
              ? "Update the meeting details below."
              : "Fill in the details to schedule a new meeting."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="meeting-form"
          onSubmit={handleSubmit}
          className="space-y-6 flex-1 overflow-y-auto min-h-0"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Meeting title"
                />
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_type_id">Meeting Type</Label>
                <Select
                  value={formData.meeting_type_id || ""}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      meeting_type_id: val === "" ? "" : val,
                    })
                  }
                >
                  <SelectTrigger id="meeting_type_id" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingTypes.map((mt) => (
                      <SelectItem key={mt.id} value={mt.id}>
                        {mt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  value={formData.platform || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                  placeholder="Zoom, Google Meet, Teams..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Meeting description or purpose"
                rows={3}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Schedule
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Date *</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={
                    formData.scheduled_date
                      ? new Date(formData.scheduled_date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduled_date: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
                {errors.start_time && (
                  <p className="text-xs text-red-500">{errors.start_time}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Location
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Physical Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Room, building, address..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Input
                  id="meeting_link"
                  value={formData.meeting_link || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Agenda Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Agenda Items
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAgendaItem}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
            </div>
            {(formData.agenda_items || []).map((item, index) => (
              <div key={index} className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Item {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAgendaItem(index)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Topic *</Label>
                    <Input
                      value={item.topic}
                      onChange={(e) =>
                        updateAgendaItem(index, "topic", e.target.value)
                      }
                      placeholder="Agenda topic"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Presenter</Label>
                    <Input
                      value={item.presenter || ""}
                      onChange={(e) =>
                        updateAgendaItem(index, "presenter", e.target.value || null)
                      }
                      placeholder="Presenter name"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration (min)</Label>
                    <Input
                      type="number"
                      value={item.duration_minutes || ""}
                      onChange={(e) =>
                        updateAgendaItem(
                          index,
                          "duration_minutes",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      placeholder="15"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Notes</Label>
                    <Input
                      value={item.notes || ""}
                      onChange={(e) =>
                        updateAgendaItem(index, "notes", e.target.value || null)
                      }
                      placeholder="Discussion notes"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(formData.agenda_items || []).length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAgendaItem}
                className="w-full"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Attendees
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttendee}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Attendee
              </Button>
            </div>
            {(formData.attendees || []).map((att, index) => (
              <div key={index} className="flex items-center gap-3">
                <Select
                  value={att.employee_id}
                  onValueChange={(val) =>
                    updateAttendee(index, "employee_id", val)
                  }
                >
                  <SelectTrigger className="flex-1 h-8">
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
                <Select
                  value={att.attendance_status}
                  onValueChange={(val) =>
                    updateAttendee(index, "attendance_status", val)
                  }
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Declined">Declined</SelectItem>
                    <SelectItem value="Tentative">Tentative</SelectItem>
                    <SelectItem value="Attended">Attended</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttendee(index)}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Attachments
              </h3>
              <label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingFiles}
                  asChild
                >
                  <span>
                    <Upload className="mr-1 h-3 w-3" />
                    {uploadingFiles ? "Uploading..." : "Upload File"}
                  </span>
                </Button>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploadingFiles}
                />
              </label>
            </div>
            {pendingFiles.length > 0 && (
              <div className="space-y-2">
                {pendingFiles.map((file, index) => (
                  <div
                    key={`pending-${index}`}
                    className="flex items-center justify-between bg-amber-50 p-2 rounded border border-amber-200"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-800 truncate max-w-[300px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-amber-600">
                        ({formatFileSize(file.size)}) — will upload on submit
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-600"
                      onClick={() => removePendingFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {(formData.attachments || []).length > 0 && (
              <div className="space-y-2">
                {(formData.attachments || []).map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-50 p-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate max-w-[300px]"
                      >
                        {url.split("/").pop()}
                      </a>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-600"
                      onClick={() => removeExistingAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recurrence */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Recurrence
              </h3>
              <Checkbox
                checked={formData.is_recurring || false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    is_recurring: !!checked,
                    recurrence: checked
                      ? {
                          frequency: "Weekly",
                          interval: 1,
                          end_type: "Never",
                          end_after: null,
                          end_date: null,
                          days_of_week: null,
                        }
                      : null,
                  })
                }
              />
            </div>
            {formData.is_recurring && formData.recurrence && (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Frequency</Label>
                    <Select
                      value={formData.recurrence.frequency}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          recurrence: {
                            ...formData.recurrence!,
                            frequency: val as Recurrence["frequency"],
                          },
                        })
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
                      value={formData.recurrence.interval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurrence: {
                            ...formData.recurrence!,
                            interval: Number(e.target.value) || 1,
                          },
                        })
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ends</Label>
                    <Select
                      value={formData.recurrence.end_type}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          recurrence: {
                            ...formData.recurrence!,
                            end_type: val as Recurrence["end_type"],
                          },
                        })
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
                {formData.recurrence.end_type === "After" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Number of occurrences</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.recurrence.end_after || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurrence: {
                            ...formData.recurrence!,
                            end_after: e.target.value
                              ? Number(e.target.value)
                              : null,
                          },
                        })
                      }
                      className="h-8 w-32"
                    />
                  </div>
                )}
                {formData.recurrence.end_type === "On Date" && (
                  <div className="space-y-1">
                    <Label className="text-xs">End date</Label>
                    <Input
                      type="date"
                      value={
                        formData.recurrence.end_date
                          ? new Date(formData.recurrence.end_date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurrence: {
                            ...formData.recurrence!,
                            end_date: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          },
                        })
                      }
                      className="h-8 w-48"
                    />
                  </div>
                )}
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
          <Button type="submit" form="meeting-form" disabled={loading || uploadingFiles}>
            {loading || uploadingFiles
              ? "Saving..."
              : meeting
              ? "Save Changes"
              : "Create Meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
