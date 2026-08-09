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
import { RefreshCw } from "lucide-react";
import type { Conversion } from "@/lib/types/conversion";

interface ConversionViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversion: Conversion | null;
  timezone?: string | null;
}

export function ConversionViewModal({
  open,
  onOpenChange,
  conversion,
  timezone,
}: ConversionViewModalProps) {
  if (!conversion) return null;

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
              <RefreshCw className="size-5 text-[#3b82f6]" />
            </div>
            <div>
              <div>Conversion {conversion.code}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                  {conversion.code}
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
                <p className="text-sm mt-1 font-mono">{conversion.code}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Date Converted
                </p>
                <p className="text-sm mt-1 tabular-nums">
                  {formatInAppTimezone(conversion.date_converted, "MMM dd, yyyy", timezone)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Location
                </p>
                <p className="text-sm mt-1">{conversion.location_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  From Item
                </p>
                <p className="text-sm mt-1">
                  {conversion.from_item_name || "N/A"}
                  {conversion.from_item_code && (
                    <span className="text-muted-foreground ml-2">({conversion.from_item_code})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  From Quantity
                </p>
                <p className="text-sm mt-1 font-medium text-red-600">
                  -{conversion.from_qty}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  To Item
                </p>
                <p className="text-sm mt-1">
                  {conversion.to_item_name || "N/A"}
                  {conversion.to_item_code && (
                    <span className="text-muted-foreground ml-2">({conversion.to_item_code})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  To Quantity
                </p>
                <p className="text-sm mt-1 font-medium text-emerald-600">
                  +{conversion.to_qty}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Remarks
                </p>
                <p className="text-sm mt-1">{conversion.remarks || "—"}</p>
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
                  {formatInAppTimezone(conversion.created_at, "MMMM dd, yyyy", timezone)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created By
                </p>
                <p className="text-sm mt-1">{conversion.created_by_name || "N/A"}</p>
              </div>

              {conversion.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Deleted At
                    </p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {formatInAppTimezone(conversion.deleted_at, "MMMM dd, yyyy", timezone)}
                    </p>
                  </div>

                  {conversion.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Delete Reason
                      </p>
                      <p className="text-sm mt-1 text-rose-600">
                        {conversion.deleted_reason}
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
                  {conversion.updated_at
                    ? formatInAppTimezone(conversion.updated_at, "MMMM dd, yyyy", timezone)
                    : "Never"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Updated By
                </p>
                <p className="text-sm mt-1">{conversion.updated_by_name || "N/A"}</p>
              </div>

              {conversion.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Deleted By
                    </p>
                    <p className="text-sm mt-1 text-rose-600">
                      {conversion.deleted_by_name || "N/A"}
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
