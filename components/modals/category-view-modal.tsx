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
import type { Category } from "@/lib/types/category";

interface CategoryViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

const typeConfig: Record<string, { bg: string; text: string }> = {
  Inventoriable: { bg: "bg-blue-50", text: "text-blue-700" },
  Consumable: { bg: "bg-amber-50", text: "text-amber-700" },
};

export function CategoryViewModal({
  open,
  onOpenChange,
  category,
}: CategoryViewModalProps) {
  if (!category) return null;

  const sConfig = statusConfig[category.status || "Active"] || statusConfig.Active;
  const tConfig = typeConfig[category.type] || typeConfig.Inventoriable;

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
              <span className="text-lg">🏷️</span>
            </div>
            <div>
              <div>{category.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sConfig.bg} ${sConfig.text}`}>
                  <span className={`size-1.5 rounded-full ${sConfig.dot}`} />
                  {category.status}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tConfig.bg} ${tConfig.text}`}>
                  {category.type}
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
                <p className="text-sm mt-1">{category.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="text-sm mt-1">{category.type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
                <p className="text-sm mt-1">{category.description || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-4" />
          </div>

          <div className="py-3"><hr /></div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created At</p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(category.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</p>
                <p className="text-sm mt-1">{category.created_by_name || "N/A"}</p>
              </div>
              {category.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted At</p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {format(new Date(category.deleted_at), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  {category.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delete Reason</p>
                      <p className="text-sm mt-1 text-rose-600">{category.deleted_reason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
                <p className="text-sm mt-1 tabular-nums">
                  {category.updated_at
                    ? format(new Date(category.updated_at), "MMMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated By</p>
                <p className="text-sm mt-1">{category.updated_by_name || "N/A"}</p>
              </div>
              {category.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted By</p>
                  <p className="text-sm mt-1 text-rose-600">{category.deleted_by_name || "N/A"}</p>
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
