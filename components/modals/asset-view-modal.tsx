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
import type { Asset } from "@/lib/types/asset";

interface AssetViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Available: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Assigned: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Repair: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Lost: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  Disposed: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
};

export function AssetViewModal({
  open,
  onOpenChange,
  asset,
}: AssetViewModalProps) {
  if (!asset) return null;

  const sConfig = statusConfig[asset.status] || statusConfig.Available;

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
              <span className="text-lg">&#128230;</span>
            </div>
            <div>
              <div className="font-mono">{asset.barcode}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sConfig.bg} ${sConfig.text}`}>
                  <span className={`size-1.5 rounded-full ${sConfig.dot}`} />
                  {asset.status}
                </span>
                {asset.item_name && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                    {asset.item_name}
                  </span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Item</p>
                <p className="text-sm mt-1">{asset.item_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Barcode</p>
                <p className="text-sm font-mono mt-1">{asset.barcode}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Serial Number</p>
                <p className="text-sm font-mono mt-1">{asset.serial_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                <p className="text-sm mt-1">{asset.location_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned To</p>
                <p className="text-sm mt-1">{asset.assigned_to_employee_name || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</p>
                <p className="text-sm mt-1">{asset.assigned_to_department_name || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Purchase Date</p>
                <p className="text-sm mt-1 tabular-nums">
                  {asset.purchase_date
                    ? format(new Date(asset.purchase_date), "MMMM dd, yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Purchase Price</p>
                <p className="text-sm font-semibold mt-1 tabular-nums">
                  {asset.purchase_price != null
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(asset.purchase_price)
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Warranty Expiry</p>
                <p className="text-sm mt-1 tabular-nums">
                  {asset.warranty_expiry
                    ? format(new Date(asset.warranty_expiry), "MMMM dd, yyyy")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="py-3"><hr /></div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created At</p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(asset.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</p>
                <p className="text-sm mt-1">{asset.created_by_name || "N/A"}</p>
              </div>
              {asset.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted At</p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {format(new Date(asset.deleted_at), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  {asset.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delete Reason</p>
                      <p className="text-sm mt-1 text-rose-600">{asset.deleted_reason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
                <p className="text-sm mt-1 tabular-nums">
                  {asset.updated_at
                    ? format(new Date(asset.updated_at), "MMMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated By</p>
                <p className="text-sm mt-1">{asset.updated_by_name || "N/A"}</p>
              </div>
              {asset.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted By</p>
                  <p className="text-sm mt-1 text-rose-600">{asset.deleted_by_name || "N/A"}</p>
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
