"use client";

import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Meeting } from "@/lib/types/meeting";

interface MeetingViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
}

export function MeetingViewModal({
  open,
  onOpenChange,
  meeting,
}: MeetingViewModalProps) {
  if (!meeting) return null;

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Scheduled: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    "In Progress": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    Cancelled: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
    Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  };
  const sc = statusConfig[meeting.status] || statusConfig.Scheduled;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-lg">
              📅
            </div>
            <div className="flex-1">
              <span>#{meeting.meeting_no} — {meeting.title}</span>
              <div
                className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${sc.bg} ${sc.text} rounded-full`}
              >
                <span className={`size-1.5 rounded-full ${sc.dot}`} />
                {meeting.status}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 flex-1 overflow-y-auto min-h-0 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Meeting Type
              </p>
              <p className="text-sm mt-1">
                {meeting.meeting_type_name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Platform
              </p>
              <p className="text-sm mt-1">{meeting.platform || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm mt-1">
                {meeting.description || "N/A"}
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Date
              </p>
              <p className="text-sm mt-1 tabular-nums">
                {format(new Date(meeting.scheduled_date), "MMMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Start Time
              </p>
              <p className="text-sm mt-1 tabular-nums">{meeting.start_time}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                End Time
              </p>
              <p className="text-sm mt-1 tabular-nums">
                {meeting.end_time || "N/A"}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Location
              </p>
              <p className="text-sm mt-1">{meeting.location || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Meeting Link
              </p>
              {meeting.meeting_link ? (
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm mt-1 text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Join Meeting <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p className="text-sm mt-1 italic text-muted-foreground">N/A</p>
              )}
            </div>
          </div>

          {/* Agenda Items */}
          {meeting.agenda_items.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Agenda Items
              </p>
              <div className="space-y-2">
                {meeting.agenda_items.map((item) => (
                  <div key={item.id} className="rounded border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{item.topic}</p>
                      {item.duration_minutes && (
                        <span className="text-xs text-muted-foreground">
                          {item.duration_minutes} min
                        </span>
                      )}
                    </div>
                    {item.presenter && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Presenter: {item.presenter}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs mt-1">{item.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendees */}
          {meeting.attendees.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Attendees
              </p>
              <div className="grid grid-cols-2 gap-2">
                {meeting.attendees.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded border px-3 py-2"
                  >
                    <span className="text-sm">
                      {att.employee_name || "Unknown"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        att.attendance_status === "Attended"
                          ? "bg-emerald-50 text-emerald-700"
                          : att.attendance_status === "Accepted"
                          ? "bg-blue-50 text-blue-700"
                          : att.attendance_status === "Declined"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {att.attendance_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {meeting.notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Meeting Notes / Minutes
              </p>
              <div className="rounded border p-3 text-sm whitespace-pre-wrap">
                {meeting.notes}
              </div>
            </div>
          )}

          {/* Attachments */}
          {meeting.attachments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Attachments
              </p>
              <div className="space-y-1">
                {meeting.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:underline"
                  >
                    {url.split("/").pop()}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Recurrence */}
          {meeting.is_recurring && meeting.recurrence && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Recurrence
              </p>
              <p className="text-sm">
                Every {meeting.recurrence.interval}{" "}
                {meeting.recurrence.frequency.toLowerCase()}
                {meeting.recurrence.end_type === "After" &&
                  ` (${meeting.recurrence.end_after} times)`}
                {meeting.recurrence.end_type === "On Date" &&
                  ` until ${format(new Date(meeting.recurrence.end_date!), "MMM dd, yyyy")}`}
              </p>
            </div>
          )}

          <div className="py-3">
            <hr />
          </div>

          {/* Audit Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created At
                </p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(meeting.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created By
                </p>
                <p className="text-sm mt-1">
                  {meeting.created_by_name || "N/A"}
                </p>
              </div>
              {meeting.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Deleted At
                    </p>
                    <p className="text-sm mt-1 text-rose-600 tabular-nums">
                      {format(new Date(meeting.deleted_at), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  {meeting.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Delete Reason
                      </p>
                      <p className="text-sm mt-1 text-rose-600">
                        {meeting.deleted_reason}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Last Updated
                </p>
                <p className="text-sm mt-1 tabular-nums">
                  {meeting.updated_at
                    ? format(new Date(meeting.updated_at), "MMMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Updated By
                </p>
                <p className="text-sm mt-1">
                  {meeting.updated_by_name || "N/A"}
                </p>
              </div>
              {meeting.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Deleted By
                  </p>
                  <p className="text-sm mt-1 text-rose-600">
                    {meeting.deleted_by_name || "N/A"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
