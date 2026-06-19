"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ITAsset } from "@/lib/types";

interface AssetViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: ITAsset | null;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  "In Use": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Maintenance: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Retired: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  Available: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
};

export function AssetViewModal({
  open,
  onOpenChange,
  asset,
}: AssetViewModalProps) {
  if (!asset) return null;

  const config = statusConfig[asset.status] || statusConfig.Active;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {asset.name}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
              <span className={`size-1.5 rounded-full ${config.dot}`} />
              {asset.status}
            </span>
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {asset.assetTag}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="text-sm mt-1">{asset.type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Brand</p>
                <p className="text-sm mt-1">{asset.brand}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Model</p>
                <p className="text-sm mt-1">{asset.model}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Serial Number</p>
                <p className="text-sm font-mono mt-1">{asset.serialNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned To</p>
                <p className="text-sm mt-1">{asset.assignedTo || "Unassigned"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                <p className="text-sm mt-1">{asset.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</p>
                <p className="text-sm mt-1">{asset.department}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Purchase Date</p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(asset.purchaseDate), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Warranty Expiry</p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(asset.warrantyExpiry), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Purchase Cost</p>
                <p className="text-sm font-semibold mt-1 tabular-nums">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(asset.purchaseCost)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {asset.notes && (
        <div className="bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</p>
            <p className="text-sm mt-2">{asset.notes}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
