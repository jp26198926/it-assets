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
import type { Supplier } from "@/lib/types/supplier";

interface SupplierViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  timezone?: string | null;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export function SupplierViewModal({
  open,
  onOpenChange,
  supplier,
  timezone,
}: SupplierViewModalProps) {
  if (!supplier) return null;

  const sConfig = statusConfig[supplier.status || "Active"] || statusConfig.Active;

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
              <span className="text-lg">🚚</span>
            </div>
            <div>
              <div>{supplier.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sConfig.bg} ${sConfig.text}`}>
                  <span className={`size-1.5 rounded-full ${sConfig.dot}`} />
                  {supplier.status}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</p>
                <p className="text-sm mt-1">{supplier.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact Person</p>
                <p className="text-sm mt-1">{supplier.contact_person || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                <p className="text-sm mt-1">{supplier.phone || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-sm mt-1">{supplier.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</p>
                <p className="text-sm mt-1">{supplier.address || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="py-3"><hr /></div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created At</p>
                <p className="text-sm mt-1 tabular-nums">
                  {formatInAppTimezone(supplier.created_at, "MMMM dd, yyyy", timezone)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</p>
                <p className="text-sm mt-1">{supplier.created_by_name || "N/A"}</p>
              </div>
              {supplier.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted At</p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {formatInAppTimezone(supplier.deleted_at, "MMMM dd, yyyy", timezone)}
                    </p>
                  </div>
                  {supplier.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delete Reason</p>
                      <p className="text-sm mt-1 text-rose-600">{supplier.deleted_reason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
                <p className="text-sm mt-1 tabular-nums">
                  {supplier.updated_at
                    ? formatInAppTimezone(supplier.updated_at, "MMMM dd, yyyy", timezone)
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated By</p>
                <p className="text-sm mt-1">{supplier.updated_by_name || "N/A"}</p>
              </div>
              {supplier.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted By</p>
                  <p className="text-sm mt-1 text-rose-600">{supplier.deleted_by_name || "N/A"}</p>
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
