"use client";

import { formatInAppTimezone } from "@/lib/utils/timezone";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Adjustment } from "@/lib/types/adjustment";

interface AdjustmentViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustment: Adjustment | null;
  timezone?: string | null;
}

export function AdjustmentViewModal({
  open,
  onOpenChange,
  adjustment,
  timezone,
}: AdjustmentViewModalProps) {
  if (!adjustment) return null;

  const isPositive = adjustment.qty >= 0;

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
              <div>Adjustment {adjustment.code}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                  {adjustment.code}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Code
                </p>
                <p className="text-sm mt-1 font-mono">{adjustment.code}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Date Adjusted
                </p>
                <p className="text-sm mt-1 tabular-nums">
                  {formatInAppTimezone(adjustment.date_adjusted, "MMM dd, yyyy", timezone)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Location
                </p>
                <p className="text-sm mt-1">{adjustment.location_name || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Item
                </p>
                <p className="text-sm mt-1">
                  {adjustment.item_name || "N/A"}
                  {adjustment.item_code && (
                    <span className="text-muted-foreground ml-2">({adjustment.item_code})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Quantity
                </p>
                <p className={`text-sm mt-1 font-medium ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                  {isPositive ? "+" : ""}{adjustment.qty}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Remarks
                </p>
                <p className="text-sm mt-1">{adjustment.remarks || "—"}</p>
              </div>
            </div>
          </div>

          <div className="py-3"><hr /></div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created At
                </p>
                <p className="text-sm mt-1 tabular-nums">
                  {formatInAppTimezone(adjustment.created_at, "MMMM dd, yyyy", timezone)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created By
                </p>
                <p className="text-sm mt-1">{adjustment.created_by_name || "N/A"}</p>
              </div>

              {adjustment.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Deleted At
                    </p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {formatInAppTimezone(adjustment.deleted_at, "MMMM dd, yyyy", timezone)}
                    </p>
                  </div>

                  {adjustment.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Delete Reason
                      </p>
                      <p className="text-sm mt-1 text-rose-600">
                        {adjustment.deleted_reason}
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
                  {adjustment.updated_at
                    ? formatInAppTimezone(adjustment.updated_at, "MMMM dd, yyyy", timezone)
                    : "Never"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Updated By
                </p>
                <p className="text-sm mt-1">{adjustment.updated_by_name || "N/A"}</p>
              </div>

              {adjustment.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Deleted By
                    </p>
                    <p className="text-sm mt-1 text-rose-600">
                      {adjustment.deleted_by_name || "N/A"}
                    </p>
                  </div>
                </>
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
