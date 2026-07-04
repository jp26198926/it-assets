"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MeetingActionItem } from "@/lib/types/meeting-action-item";

interface MeetingActionItemViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MeetingActionItem | null;
}

export function MeetingActionItemViewModal({
  open,
  onOpenChange,
  item,
}: MeetingActionItemViewModalProps) {
  if (!item) return null;

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Pending: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
    "In Progress": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    Cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
    Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  };
  const sc = statusConfig[item.status] || statusConfig.Pending;

  const priorityConfig: Record<string, { bg: string; text: string }> = {
    Low: { bg: "bg-gray-50", text: "text-gray-700" },
    Medium: { bg: "bg-blue-50", text: "text-blue-700" },
    High: { bg: "bg-amber-50", text: "text-amber-700" },
    Urgent: { bg: "bg-red-50", text: "text-red-700" },
  };
  const pc = priorityConfig[item.priority] || priorityConfig.Medium;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 text-lg">
              ✅
            </div>
            <div className="flex-1">
              <span>{item.title}</span>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${sc.bg} ${sc.text} rounded-full`}
                >
                  <span className={`size-1.5 rounded-full ${sc.dot}`} />
                  {item.status}
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${pc.bg} ${pc.text}`}
                >
                  {item.priority}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 flex-1 overflow-y-auto min-h-0 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Meeting
              </p>
              <p className="text-sm mt-1">
                {item.meeting_no ? `#${item.meeting_no}` : ""}{" "}
                {item.meeting_title || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Assigned To
              </p>
              <p className="text-sm mt-1">
                {item.assigned_to_name || "Unassigned"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Due Date
              </p>
              <p className="text-sm mt-1">
                {item.due_date
                  ? format(new Date(item.due_date), "MMMM dd, yyyy")
                  : "N/A"}
              </p>
            </div>
            {item.completed_at && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Completed At
                </p>
                <p className="text-sm mt-1">
                  {format(new Date(item.completed_at), "MMMM dd, yyyy")}
                </p>
              </div>
            )}
          </div>

          {item.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          )}

          <div className="py-3">
            <hr />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created At
                </p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(item.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created By
                </p>
                <p className="text-sm mt-1">
                  {item.created_by_name || "N/A"}
                </p>
              </div>
              {item.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Deleted At
                    </p>
                    <p className="text-sm mt-1 text-rose-600 tabular-nums">
                      {format(new Date(item.deleted_at), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  {item.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Delete Reason
                      </p>
                      <p className="text-sm mt-1 text-rose-600">
                        {item.deleted_reason}
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
                  {item.updated_at
                    ? format(new Date(item.updated_at), "MMMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Updated By
                </p>
                <p className="text-sm mt-1">
                  {item.updated_by_name || "N/A"}
                </p>
              </div>
              {item.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Deleted By
                  </p>
                  <p className="text-sm mt-1 text-rose-600">
                    {item.deleted_by_name || "N/A"}
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
