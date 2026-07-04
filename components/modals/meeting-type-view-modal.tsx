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
import type { MeetingType } from "@/lib/types/meeting-type";

interface MeetingTypeViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingType: MeetingType | null;
}

export function MeetingTypeViewModal({
  open,
  onOpenChange,
  meetingType,
}: MeetingTypeViewModalProps) {
  if (!meetingType) return null;

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  };
  const sc = statusConfig[meetingType.status] || statusConfig.Active;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-50">
              {meetingType.color ? (
                <span
                  className="inline-block h-5 w-5 rounded-full"
                  style={{ backgroundColor: meetingType.color }}
                />
              ) : (
                "🏷️"
              )}
            </div>
            <span>{meetingType.name}</span>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${sc.bg} ${sc.text} rounded-full`}
            >
              <span className={`size-1.5 rounded-full ${sc.dot}`} />
              {meetingType.status}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Name
              </p>
              <p className="text-sm mt-1">{meetingType.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </p>
              <p className="text-sm mt-1">{meetingType.status}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm mt-1">
                {meetingType.description || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Color
              </p>
              <div className="flex items-center gap-2 mt-1">
                {meetingType.color ? (
                  <>
                    <span
                      className="inline-block h-4 w-4 rounded-full border"
                      style={{ backgroundColor: meetingType.color }}
                    />
                    <span className="text-sm">{meetingType.color}</span>
                  </>
                ) : (
                  <span className="text-sm italic text-muted-foreground">
                    N/A
                  </span>
                )}
              </div>
            </div>
          </div>

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
                  {format(new Date(meetingType.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created By
                </p>
                <p className="text-sm mt-1">
                  {meetingType.created_by_name || "N/A"}
                </p>
              </div>
              {meetingType.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Deleted At
                    </p>
                    <p className="text-sm mt-1 text-rose-600 tabular-nums">
                      {format(
                        new Date(meetingType.deleted_at),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  </div>
                  {meetingType.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Delete Reason
                      </p>
                      <p className="text-sm mt-1 text-rose-600">
                        {meetingType.deleted_reason}
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
                  {meetingType.updated_at
                    ? format(new Date(meetingType.updated_at), "MMMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Updated By
                </p>
                <p className="text-sm mt-1">
                  {meetingType.updated_by_name || "N/A"}
                </p>
              </div>
              {meetingType.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Deleted By
                  </p>
                  <p className="text-sm mt-1 text-rose-600">
                    {meetingType.deleted_by_name || "N/A"}
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
