"use client";

import { format, isAfter } from "date-fns";
import { MoreHorizontal, Eye, Edit, Trash2, RotateCcw, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { ITAsset } from "@/lib/types";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  "In Use": { color: "bg-[#e8f0fe] text-[#3b82f6]", dot: "bg-[#3b82f6]" },
  Maintenance: { color: "bg-[#fef3c7] text-[#d97706]", dot: "bg-[#d97706]" },
  Retired: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
  Available: { color: "bg-[#ede9fe] text-[#7c3aed]", dot: "bg-[#7c3aed]" },
};

interface MobileCardProps {
  asset: ITAsset;
  onView: (asset: ITAsset) => void;
  onEdit: (asset: ITAsset) => void;
  onDelete: (asset: ITAsset) => void;
  onRestore: (asset: ITAsset) => void;
}

export function AssetMobileCard({
  asset,
  onView,
  onEdit,
  onDelete,
  onRestore,
}: MobileCardProps) {
  const config = statusConfig[asset.status] || statusConfig.Active;
  const expiry = new Date(asset.warrantyExpiry);
  const isExpired = !isAfter(expiry, new Date());

  return (
    <div className="bg-white shadow-sm border border-[#e2e8f0] p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center ${config.color}`}>
            <Package className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#1a1f36] truncate">{asset.name}</p>
            <p className="text-xs text-[#64748b] font-mono">{asset.assetTag}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#f0f4f8]">
              <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
            <DropdownMenuItem onClick={() => onView(asset)} className="cursor-pointer gap-2 text-[#1a1f36]">
              <Eye className="h-4 w-4 text-[#64748b]" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(asset)} className="cursor-pointer gap-2 text-[#1a1f36]">
              <Edit className="h-4 w-4 text-[#64748b]" />
              Edit Asset
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!asset.isDeleted ? (
              <DropdownMenuItem
                onClick={() => onDelete(asset)}
                className="cursor-pointer gap-2 text-[#dc2626]"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onRestore(asset)}
                className="cursor-pointer gap-2 text-[#059669]"
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold ${config.color}`}>
          <span className={`size-1.5 ${config.dot}`} />
          {asset.status}
        </div>
        <span className="text-xs text-[#64748b]">{asset.type}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold">Brand / Model</p>
          <p className="text-[#1a1f36] truncate">{asset.brand} {asset.model}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold">Location</p>
          <p className="text-[#1a1f36] truncate">{asset.location}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold">Assigned To</p>
          {asset.assignedTo ? (
            <div className="flex items-center gap-1.5">
              <div className="flex size-5 items-center justify-center bg-[#e8f0fe] text-[#3b82f6] text-[8px] font-bold">
                {asset.assignedTo.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <span className="text-[#1a1f36] truncate">{asset.assignedTo}</span>
            </div>
          ) : (
            <span className="text-[#94a3b8] italic">Unassigned</span>
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold">Cost</p>
          <p className="text-[#1a1f36] font-semibold tabular-nums">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(asset.purchaseCost)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold">Purchase Date</p>
          <p className="text-[#1a1f36] tabular-nums">{format(new Date(asset.purchaseDate), "MMM dd, yyyy")}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold">Warranty Expiry</p>
          <p className={`tabular-nums ${isExpired ? "text-[#dc2626] font-semibold" : "text-[#1a1f36]"}`}>
            {format(expiry, "MMM dd, yyyy")}
            {isExpired && <span className="ml-1 text-[8px] bg-[#fee2e2] text-[#dc2626] px-1 py-0.5">Expired</span>}
          </p>
        </div>
      </div>

      {asset.notes && (
        <div className="pt-2 border-t border-[#f0f4f8]">
          <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold mb-1">Notes</p>
          <p className="text-xs text-[#64748b] line-clamp-2">{asset.notes}</p>
        </div>
      )}
    </div>
  );
}
