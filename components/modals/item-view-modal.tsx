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
import Image from "next/image";
import type { Item } from "@/lib/types/item";

interface ItemViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> =
  {
    Active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  };

export function ItemViewModal({
  open,
  onOpenChange,
  item,
}: ItemViewModalProps) {
  if (!item) return null;

  const sConfig = statusConfig[item.status || "Active"] || statusConfig.Active;

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
              <span className="text-lg">📦</span>
            </div>
            <div>
              <div>{item.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sConfig.bg} ${sConfig.text}`}
                >
                  <span className={`size-1.5 rounded-full ${sConfig.dot}`} />
                  {item.status}
                </span>
                {item.category_name && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                    {item.category_name}
                  </span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 space-y-4 flex-1 overflow-y-auto min-h-0">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Name
            </p>
            <p className="text-sm mt-1">{item.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Item Code
                </p>
                <p className="text-sm mt-1 font-mono">
                  {item.item_code || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Category
                </p>
                <p className="text-sm mt-1">{item.category_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Brand
                </p>
                <p className="text-sm mt-1">{item.brand || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  UOM
                </p>
                <p className="text-sm mt-1">
                  {item.uom_name
                    ? item.uom_code
                      ? `${item.uom_code} - ${item.uom_name}`
                      : item.uom_name
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Minimum Stock
                </p>
                <p className="text-sm mt-1 tabular-nums">
                  {item.minimum_stock}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Model
                </p>
                <p className="text-sm mt-1">{item.model || "N/A"}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </p>
            <p className="text-sm mt-1">{item.description || "N/A"}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Image URL
            </p>
            {item.image_url ? (
              <a
                href={item.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block relative"
              >
                <div className="h-20 w-20 rounded-md bg-muted animate-pulse" />
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={80}
                  height={80}
                  unoptimized
                  className="absolute inset-0 rounded-md object-cover border hover:opacity-80 transition-opacity"
                />
              </a>
            ) : (
              <p className="text-sm mt-1">N/A</p>
            )}
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
                  {format(new Date(item.created_at), "yyyy-MM-dd HH:mm:ss")}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created By
                </p>
                <p className="text-sm mt-1">{item.created_by_name || "N/A"}</p>
              </div>

              {item.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Deleted At
                    </p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {format(new Date(item.deleted_at), "yyyy-MM-dd HH:mm:ss")}
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
                    ? format(new Date(item.updated_at), "yyyy-MM-dd HH:mm:ss")
                    : "Never"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Updated By
                </p>
                <p className="text-sm mt-1">{item.updated_by_name || "N/A"}</p>
              </div>

              {item.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Deleted By
                    </p>
                    <p className="text-sm mt-1 text-rose-600">
                      {item.deleted_by_name || "N/A"}
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
