"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Assignment } from "@/lib/types/assignment";

interface AssignmentViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Returned: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export function AssignmentViewModal({
  open,
  onOpenChange,
  assignment,
}: AssignmentViewModalProps) {
  if (!assignment) return null;

  const config = statusConfig[assignment.status || "Active"] || statusConfig.Active;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center bg-[#f0f4f8]">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <div>Assignment Details</div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
                <span className={`size-1.5 rounded-full ${config.dot}`} />
                {assignment.status}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Asset Barcode</p>
                <p className="text-sm mt-1 font-medium">{assignment.asset_barcode || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Employee</p>
                <p className="text-sm mt-1">{assignment.employee_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</p>
                <p className="text-sm mt-1">{assignment.department_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                <p className="text-sm mt-1">{assignment.location_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned Date</p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(assignment.assigned_date), "MMMM dd, yyyy")}
                </p>
              </div>
              {assignment.returned_date && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Returned Date</p>
                  <p className="text-sm mt-1 tabular-nums">
                    {format(new Date(assignment.returned_date), "MMMM dd, yyyy")}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Condition on Issue</p>
                <p className="text-sm mt-1">{assignment.condition_on_issue}</p>
              </div>
              {assignment.condition_on_return && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Condition on Return</p>
                  <p className="text-sm mt-1">{assignment.condition_on_return}</p>
                </div>
              )}
              {assignment.remarks && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Remarks</p>
                <p className="text-sm mt-1">{assignment.remarks}</p>
              </div>
            )}
            </div>
          </div>

          <div className="py-3"><hr /></div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created At</p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(assignment.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</p>
                <p className="text-sm mt-1">{assignment.created_by_name || "N/A"}</p>
              </div>
              {assignment.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted At</p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {format(new Date(assignment.deleted_at), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  {assignment.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delete Reason</p>
                      <p className="text-sm mt-1 text-rose-600">{assignment.deleted_reason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
                <p className="text-sm mt-1 tabular-nums">
                  {assignment.updated_at
                    ? format(new Date(assignment.updated_at), "MMMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated By</p>
                <p className="text-sm mt-1">{assignment.updated_by_name || "N/A"}</p>
              </div>
              {assignment.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted By</p>
                  <p className="text-sm mt-1 text-rose-600">{assignment.deleted_by_name || "N/A"}</p>
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
