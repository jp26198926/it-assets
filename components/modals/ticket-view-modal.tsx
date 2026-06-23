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
import { FileText, ImageIcon } from "lucide-react";
import type { Ticket } from "@/lib/types/ticket";

interface TicketViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
}

const priorityConfig: Record<string, { bg: string; text: string }> = {
  Low: { bg: "bg-blue-50", text: "text-blue-700" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700" },
  High: { bg: "bg-orange-50", text: "text-orange-700" },
  Critical: { bg: "bg-red-50", text: "text-red-700" },
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Open: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]", dot: "bg-[#1d4ed8]" },
  "In Progress": { bg: "bg-[#fef3c7]", text: "text-[#b45309]", dot: "bg-[#b45309]" },
  Resolved: { bg: "bg-[#d1fae5]", text: "text-[#059669]", dot: "bg-[#059669]" },
  Closed: { bg: "bg-[#e2e8f0]", text: "text-[#475569]", dot: "bg-[#475569]" },
  Deleted: { bg: "bg-[#fee2e2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
};

export function TicketViewModal({
  open,
  onOpenChange,
  ticket,
}: TicketViewModalProps) {
  if (!ticket) return null;

  const pConfig = priorityConfig[ticket.priority] || priorityConfig.Low;
  const sConfig = statusConfig[ticket.status] || statusConfig.Open;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center bg-[#f0f4f8]">
              <span className="text-lg">🎫</span>
            </div>
            <div>
              <div>{ticket.ticket_no}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pConfig.bg} ${pConfig.text}`}>
                  {ticket.priority}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sConfig.bg} ${sConfig.text}`}>
                  <span className={`size-1.5 rounded-full ${sConfig.dot}`} />
                  {ticket.status}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</p>
                <p className="text-sm mt-1 font-medium">{ticket.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</p>
                <p className="text-sm mt-1">{ticket.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-sm mt-1">{ticket.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Requestor</p>
                <p className="text-sm mt-1">{ticket.requestor_name || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</p>
                <p className="text-sm mt-1">{ticket.category_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Asset</p>
                <p className="text-sm mt-1">{ticket.asset_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned To</p>
                <p className="text-sm mt-1">{ticket.assigned_to_name || "Unassigned"}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
            <div
              className="prose prose-sm max-w-none mt-1 text-sm"
              dangerouslySetInnerHTML={{ __html: ticket.description }}
            />
          </div>

          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attachments</p>
              <div className="mt-2 space-y-2">
                {ticket.attachments.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-[#e2e8f0]">
                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <ImageIcon className="h-4 w-4 text-[#3b82f6]" />
                    ) : (
                      <FileText className="h-4 w-4 text-[#64748b]" />
                    )}
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#3b82f6] hover:underline truncate">
                      {url.split("/").pop()}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="py-3"><hr /></div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created At</p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(ticket.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</p>
                <p className="text-sm mt-1">{ticket.created_by_name || "N/A"}</p>
              </div>
              {ticket.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted At</p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {format(new Date(ticket.deleted_at), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  {ticket.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delete Reason</p>
                      <p className="text-sm mt-1 text-rose-600">{ticket.deleted_reason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
                <p className="text-sm mt-1 tabular-nums">
                  {ticket.updated_at
                    ? format(new Date(ticket.updated_at), "MMMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated By</p>
                <p className="text-sm mt-1">{ticket.updated_by_name || "N/A"}</p>
              </div>
              {ticket.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted By</p>
                  <p className="text-sm mt-1 text-rose-600">{ticket.deleted_by_name || "N/A"}</p>
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
