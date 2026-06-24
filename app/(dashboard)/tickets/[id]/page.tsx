"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ImageIcon,
  ChevronDown,
  ChevronRight,
  Edit,
  Printer,
  ClipboardCheck,
  Paperclip,
  Send,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { TicketUpdateStatusModal } from "@/components/modals/ticket-update-status-modal";
import { TicketEditModal } from "@/components/modals/ticket-edit-modal";
import { getTicketById, updateTicket, getActiveTicketCategories } from "@/lib/actions/ticket-actions";
import type { Ticket } from "@/lib/types/ticket";
import { toast } from "sonner";

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

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);
  const [selectOptions, setSelectOptions] = useState<{
    categories: { id: string; name: string }[];
  }>({ categories: [] });

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const [data, categories] = await Promise.all([
          getTicketById(params.id as string),
          getActiveTicketCategories(),
        ]);
        if (data) {
          setTicket(data);
        } else {
          setError(true);
        }
        setSelectOptions({ categories });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!ticket) return;
    try {
      await updateTicket(ticket.id, { status: newStatus as "Open" | "In Progress" | "Resolved" | "Closed" });
      setTicket({ ...ticket, status: newStatus as Ticket["status"] });
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleEditConfirm = async (data: { name: string; category_id: string; priority: string }) => {
    if (!ticket) return;
    try {
      await updateTicket(ticket.id, {
        name: data.name,
        category_id: data.category_id,
        priority: data.priority as "Low" | "Medium" | "High" | "Critical",
      });
      const refreshed = await getTicketById(ticket.id);
      if (refreshed) setTicket(refreshed);
      toast.success("Ticket updated successfully");
    } catch {
      toast.error("Failed to update ticket");
    }
  };

  const handleMarkResolved = async () => {
    if (!ticket) return;
    try {
      await updateTicket(ticket.id, { status: "Resolved" });
      setTicket({ ...ticket, status: "Resolved" });
      toast.success("Ticket marked as resolved");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Ticket Details
            </h1>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Ticket Details
            </h1>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-[#64748b] mb-4">Ticket not found</p>
            <Button variant="outline" onClick={() => router.push("/tickets")}>
              Back to Tickets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pConfig = priorityConfig[ticket.priority] || priorityConfig.Low;
  const sConfig = statusConfig[ticket.status] || statusConfig.Open;
  const timeAgo = formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true });

  return (
    <PageGuard pagePath="/tickets">
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left — Main Content */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6">
              {/* Ticket Header */}
              <div className="bg-white shadow-sm rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#1a1f36]">{ticket.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-[#64748b]">
                  <span>Contact: <span className="font-medium text-[#1a1f36]">{ticket.name}</span></span>
                  <span>&middot;</span>
                  <span>{timeAgo}</span>
                </div>
              </div>

              {/* Description + Attachments */}
              <div className="bg-white shadow-sm rounded-xl p-6">
                <div
                  className="prose prose-sm max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: ticket.description }}
                />

                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Attachments</p>
                    <div className="space-y-2">
                      {ticket.attachments.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <ImageIcon className="h-4 w-4 text-[#3b82f6] shrink-0" />
                          ) : (
                            <Paperclip className="h-4 w-4 text-[#64748b] shrink-0" />
                          )}
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:underline truncate">
                            {url.split("/").pop()}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment Note Banner */}
              {ticket.assigned_to_name && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                  <p className="text-sm text-amber-800">
                    Note: This ticket is assigned to <span className="font-semibold">{ticket.assigned_to_name}</span>
                  </p>
                </div>
              )}

              {/* Reply / Comment Input */}
              <div className="bg-white shadow-sm rounded-xl p-6">
                <p className="text-sm font-medium text-[#1a1f36] mb-4">Reply</p>
                <RichTextEditor
                  content={replyContent}
                  onChange={setReplyContent}
                  placeholder="Type your message"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#64748b] cursor-pointer hover:text-[#1a1f36]">
                    <Upload className="h-4 w-4" />
                    <span>Upload Attachment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-2">
                      <Send className="h-4 w-4" />
                      Submit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Send className="h-4 w-4" />
                      Submit as Resolved
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right — Sidebar */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              {/* Action Buttons */}
              <div className="bg-white shadow-sm rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={() => setEditModalOpen(true)}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 flex-1">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={() => setStatusModalOpen(true)}>
                    <ClipboardCheck className="h-4 w-4" />
                    Update Status
                  </Button>
                </div>
              </div>

              {/* Ticket Metadata */}
              <div className="bg-white shadow-sm rounded-xl p-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Ticket status</p>
                  <div className="flex items-center gap-2">
                    <Badge className={`${sConfig.bg} ${sConfig.text} border-0`}>
                      <span className={`size-1.5 rounded-full ${sConfig.dot} mr-1`} />
                      {ticket.status}
                    </Badge>
                    {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
                      <button
                        className="text-xs text-[#3b82f6] hover:underline"
                        onClick={() => setResolveConfirmOpen(true)}
                      >
                        [Mark as Resolved]
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Category</p>
                  <p className="text-sm font-medium text-[#1a1f36]">{ticket.category_name || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Priority</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pConfig.bg} ${pConfig.text}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Assigned to</p>
                  <p className="text-sm font-medium text-[#1a1f36]">{ticket.assigned_to_name || "Unassigned"}</p>
                </div>
              </div>

              {/* Ticket Details (Collapsible) */}
              <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                <div className="bg-white shadow-sm rounded-xl">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                    <h3 className="text-sm font-semibold text-[#1a1f36]">Ticket Details</h3>
                    {detailsOpen ? (
                      <ChevronDown className="h-4 w-4 text-[#64748b]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[#64748b]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">Ticket number</span>
                        <span className="text-sm font-medium text-[#1a1f36]">{ticket.ticket_no}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">Created on</span>
                        <span className="text-sm text-[#1a1f36]">
                          {format(new Date(ticket.created_at), "yyyy-MM-dd HH:mm:ss")}
                        </span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">Updated</span>
                        <span className="text-sm text-[#1a1f36]">
                          {ticket.updated_at
                            ? format(new Date(ticket.updated_at), "yyyy-MM-dd HH:mm:ss")
                            : "Never"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">Replies</span>
                        <span className="text-sm text-[#1a1f36]">0</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">Last replier</span>
                        <span className="text-sm text-[#1a1f36]">N/A</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">Due date</span>
                        <span className="text-sm text-[#3b82f6] cursor-pointer hover:underline">None</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* Ticket History (Collapsible — placeholder) */}
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <div className="bg-white shadow-sm rounded-xl">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                    <h3 className="text-sm font-semibold text-[#1a1f36]">Ticket History</h3>
                    {historyOpen ? (
                      <ChevronDown className="h-4 w-4 text-[#64748b]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[#64748b]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <p className="text-sm text-[#64748b]">No history yet.</p>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <TicketUpdateStatusModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        currentStatus={ticket.status}
        onConfirm={handleStatusUpdate}
      />

      <TicketEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        ticket={ticket}
        selectOptions={selectOptions}
        onConfirm={handleEditConfirm}
      />

      <AlertDialog open={resolveConfirmOpen} onOpenChange={setResolveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Resolved</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this ticket as resolved? This will change the status to &quot;Resolved&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkResolved}>
              Yes, Mark as Resolved
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageGuard>
  );
}
