"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { formatInAppTimezone } from "@/lib/utils/timezone";
import {
  ImageIcon,
  ChevronDown,
  ChevronRight,
  Edit,
  Printer,
  ClipboardCheck,
  UserPlus,
  Paperclip,
  Send,
  Upload,
  ArrowLeft,
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
import { PageGuard } from "@/components/auth/page-guard";
import { useAuthorization } from "@/hooks/use-authorization";
import { TicketUpdateStatusModal } from "@/components/modals/ticket-update-status-modal";
import { TicketEditModal } from "@/components/modals/ticket-edit-modal";
import { TicketAssignModal } from "@/components/modals/ticket-assign-modal";
import {
  getTicketById,
  updateTicket,
  getTicketStatusLogs,
  getTicketStatusLogTotal,
  getTicketSelectOptions,
} from "@/lib/actions/ticket-actions";
import {
  createTicketComment,
  getTicketComments,
  getTicketCommentTotal,
} from "@/lib/actions/ticket-comment-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import { getCloudinarySettings } from "@/lib/actions/cloudinary-actions";
import { getAssetById } from "@/lib/actions/asset-actions";
import type { Ticket } from "@/lib/types/ticket";
import type { TicketStatusLog } from "@/lib/types/ticket-status-log";
import type { TicketComment } from "@/lib/types/ticket-comment";
import { toast } from "sonner";
import { useBreadcrumbOverrides } from "@/components/layout/breadcrumb-override-context";

const priorityConfig: Record<string, { bg: string; text: string }> = {
  Low: { bg: "bg-blue-50", text: "text-blue-700" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700" },
  High: { bg: "bg-orange-50", text: "text-orange-700" },
  Critical: { bg: "bg-red-50", text: "text-red-700" },
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> =
  {
    Open: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]", dot: "bg-[#1d4ed8]" },
    "In Progress": {
      bg: "bg-[#fef3c7]",
      text: "text-[#b45309]",
      dot: "bg-[#b45309]",
    },
    Resolved: {
      bg: "bg-[#d1fae5]",
      text: "text-[#059669]",
      dot: "bg-[#059669]",
    },
    Closed: { bg: "bg-[#e2e8f0]", text: "text-[#475569]", dot: "bg-[#475569]" },
    Deleted: {
      bg: "bg-[#fee2e2]",
      text: "text-[#dc2626]",
      dot: "bg-[#dc2626]",
    },
  };

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [assetDetailsOpen, setAssetDetailsOpen] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusLogs, setStatusLogs] = useState<TicketStatusLog[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const LOG_PAGE_SIZE = 5;
  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const COMMENT_PAGE_SIZE = 20;
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [editorKey, setEditorKey] = useState(0);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [selectOptions, setSelectOptions] = useState<{
    categories: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    users: { id: string; name: string }[];
    assets: { id: string; barcode: string; itemName: string }[];
  }>({ categories: [], departments: [], users: [], assets: [] });
  const [appSettings, setAppSettings] = useState<{
    app_name: string;
    tagline: string;
    timezone: string | null;
  }>({ app_name: "", tagline: "", timezone: null });
  const [assetDetails, setAssetDetails] = useState<{
    serial_number: string | null;
    item_brand: string | null;
    item_model: string | null;
  } | null>(null);
  const { setOverrides: setBreadcrumbOverrides } = useBreadcrumbOverrides();
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/tickets", "Edit");
  const canAssign = hasPermission("/tickets", "Assign");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketId = params.id as string;
        const [
          data,
          logs,
          total,
          commentData,
          commentCount,
          settings,
          options,
          cloudinarySettings,
        ] = await Promise.all([
          getTicketById(ticketId),
          getTicketStatusLogs(ticketId, LOG_PAGE_SIZE, 0),
          getTicketStatusLogTotal(ticketId),
          getTicketComments(ticketId, COMMENT_PAGE_SIZE, 0),
          getTicketCommentTotal(ticketId),
          getAppSettings(),
          getTicketSelectOptions(),
          getCloudinarySettings(),
        ]);
        if (data) {
          setTicket(data);
          setBreadcrumbOverrides({ [ticketId]: data.ticket_no });
        } else {
          setError(true);
        }
        setSelectOptions({
          categories: options.categories,
          departments: options.departments,
          users: options.users || [],
          assets: options.assets || [],
        });
        setStatusLogs(logs);
        setLogTotal(total);
        setComments(commentData);
        setCommentTotal(commentCount);
        setAppSettings({
          app_name: settings.app_name,
          tagline: settings.tagline,
          timezone: settings.timezone,
        });
        setMaxFileSize(cloudinarySettings.max_file_size || 10);
        if (data?.asset_id) {
          const asset = await getAssetById(data.asset_id);
          if (asset) {
            setAssetDetails({
              serial_number: asset.serial_number || null,
              item_brand: asset.item_brand || null,
              item_model: asset.item_model || null,
            });
          }
        }
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
      await updateTicket(ticket.id, {
        status: newStatus as "Open" | "In Progress" | "Resolved" | "Closed",
      });
      setTicket({ ...ticket, status: newStatus as Ticket["status"] });
      const [logs, total] = await Promise.all([
        getTicketStatusLogs(ticket.id, LOG_PAGE_SIZE, 0),
        getTicketStatusLogTotal(ticket.id),
      ]);
      setStatusLogs(logs);
      setLogTotal(total);
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAssign = async (userId: string) => {
    if (!ticket) return;
    try {
      await updateTicket(ticket.id, { assigned_to: userId || undefined });
      const refreshed = await getTicketById(ticket.id);
      if (refreshed) setTicket(refreshed);
      const [logs, total] = await Promise.all([
        getTicketStatusLogs(ticket.id, LOG_PAGE_SIZE, 0),
        getTicketStatusLogTotal(ticket.id),
      ]);
      setStatusLogs(logs);
      setLogTotal(total);
      toast.success(
        userId ? "Ticket assigned successfully" : "Ticket unassigned",
      );
    } catch {
      toast.error("Failed to assign ticket");
    }
  };

  const handleEditConfirm = async (data: {
    name: string;
    category_id: string;
    department_id: string;
    priority: string;
    asset_id: string;
  }) => {
    if (!ticket) return;
    try {
      await updateTicket(ticket.id, {
        name: data.name,
        category_id: data.category_id,
        department_id: data.department_id || undefined,
        priority: data.priority as "Low" | "Medium" | "High" | "Critical",
        asset_id: data.asset_id || undefined,
      });
      const refreshed = await getTicketById(ticket.id);
      if (refreshed) setTicket(refreshed);
      const [logs, total] = await Promise.all([
        getTicketStatusLogs(ticket.id, LOG_PAGE_SIZE, 0),
        getTicketStatusLogTotal(ticket.id),
      ]);
      setStatusLogs(logs);
      setLogTotal(total);
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
      const [logs, total] = await Promise.all([
        getTicketStatusLogs(ticket.id, LOG_PAGE_SIZE, 0),
        getTicketStatusLogTotal(ticket.id),
      ]);
      setStatusLogs(logs);
      setLogTotal(total);
      toast.success("Ticket marked as resolved");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleLoadMoreLogs = async () => {
    if (!ticket) return;
    setLogsLoading(true);
    try {
      const moreLogs = await getTicketStatusLogs(
        ticket.id,
        LOG_PAGE_SIZE,
        statusLogs.length,
      );
      setStatusLogs((prev) => [...prev, ...moreLogs]);
    } catch {
      toast.error("Failed to load more logs");
    } finally {
      setLogsLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("fileName", file.name);
    const res = await fetch("/api/tickets/upload", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json();
    if (data.success && data.url) {
      return { success: true, url: data.url };
    }
    return { success: false, error: data.error || "Upload failed" };
  };

  const handleSubmitComment = async (resolveAfter?: boolean) => {
    if (!ticket || (!replyContent.trim() && attachments.length === 0)) return;
    setSubmitting(true);
    try {
      let uploadedUrls: string[] = [];
      if (attachments.length > 0) {
        setUploadingFiles(true);
        const maxBytes = maxFileSize * 1024 * 1024;
        for (const file of attachments) {
          if (file.size > maxBytes) {
            toast.error(`"${file.name}" exceeds the ${maxFileSize} MB limit. Please choose a smaller file.`);
            continue;
          }
          const result = await uploadFile(file);
          if (result.success && result.url) {
            uploadedUrls.push(result.url);
          } else {
            toast.error(result.error || `Failed to upload ${file.name}`);
          }
        }
        setUploadingFiles(false);
      }
      await createTicketComment({
        ticket_id: ticket.id,
        message: replyContent,
        attachments: uploadedUrls,
      });
      setReplyContent("");
      setAttachments([]);
      setEditorKey((k) => k + 1);
      const [updatedComments, count] = await Promise.all([
        getTicketComments(ticket.id, COMMENT_PAGE_SIZE, 0),
        getTicketCommentTotal(ticket.id),
      ]);
      setComments(updatedComments);
      setCommentTotal(count);

      if (resolveAfter) {
        await updateTicket(ticket.id, { status: "Resolved" });
        setTicket({ ...ticket, status: "Resolved" });
        const [logs, logCount] = await Promise.all([
          getTicketStatusLogs(ticket.id, LOG_PAGE_SIZE, 0),
          getTicketStatusLogTotal(ticket.id),
        ]);
        setStatusLogs(logs);
        setLogTotal(logCount);
        toast.success("Reply submitted and ticket marked as resolved");
      } else {
        toast.success("Reply submitted");
      }
    } catch {
      toast.error("Failed to submit reply");
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
    }
  };

  const handleRichTextImageUpload = async (
    file: File,
  ): Promise<string | null> => {
    try {
      const maxBytes = maxFileSize * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(`"${file.name}" exceeds the ${maxFileSize} MB limit. Please choose a smaller file.`);
        return null;
      }

      const result = await uploadFile(file);
      if (result.success && result.url) {
        return result.url;
      }
      toast.error(result.error || "Failed to upload image");
      return null;
    } catch {
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxBytes = maxFileSize * 1024 * 1024;
    const newFiles = Array.from(files).filter((file) => {
      if (file.size > maxBytes) {
        toast.error(`"${file.name}" exceeds the ${maxFileSize} MB limit. Please choose a smaller file.`);
        return false;
      }
      return true;
    });
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePrint = () => {
    if (!ticket) return;

    const assetSection = ticket.asset_name
      ? `
      <div class="section">
        <div class="section-header">Section 3 — Asset Information</div>
        <table class="field-table"><tbody>
          <tr>
            <td class="field-label">Asset Name</td><td class="field-value">${ticket.asset_name}</td>
            <td class="field-label">Serial Number</td><td class="field-value">${assetDetails?.serial_number || "N/A"}</td>
          </tr>
          <tr>
            <td class="field-label">Brand</td><td class="field-value">${assetDetails?.item_brand || "N/A"}</td>
            <td class="field-label">Model</td><td class="field-value">${assetDetails?.item_model || "N/A"}</td>
          </tr>
        </tbody></table>
      </div>`
      : "";

    const descSectionNum = ticket.asset_name ? "Section 4" : "Section 3";

    const conversationHtml =
      comments.length > 0
        ? (() => {
            const logSectionNum = ticket.asset_name ? "Section 5" : "Section 4";
            const commentBlocks = comments
              .map((c) => {
                const text = (c.message.replace(/<[^>]*>/g, "") || "(no text)")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");
                return `
          <div class="comment-block">
            <div class="comment-header">
              <span class="comment-author">${c.created_by_name || "Unknown"}</span>
              <span class="comment-date">${formatInAppTimezone(c.created_at, "dd-MMM-yyyy hh:mm a", appSettings.timezone)}</span>
            </div>
            <div class="comment-body">
              <p>${text}</p>
              ${c.message.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '<div class="comment-img"><img src="$1" /></div>')}
            </div>
          </div>`;
              })
              .join("");
            return `
        <div class="section">
          <div class="section-header">${logSectionNum} — Conversation</div>
          ${commentBlocks}
        </div>`;
          })()
        : "";

    const descImages = ticket.description.replace(
      /<img[^>]*src="([^"]*)"[^>]*>/gi,
      '<div class="desc-img"><img src="$1" /></div>',
    );

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Ticket ${ticket.ticket_no}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #1a1a1a; line-height: 1.4; padding: 1.5cm; }
  .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .header-left .company-name { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
  .header-left .tagline { font-size: 10px; color: #555; margin-top: 1px; }
  .header-right { text-align: right; font-size: 9px; line-height: 1.6; }
  .header-right .label { font-weight: 700; }
  .double-hr { border: none; border-top: 3px double #000; margin: 6px 0; }
  .form-title { text-align: center; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin: 8px 0 2px; }
  .form-subtitle { text-align: center; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 8px; }
  .section { border: 1px solid #000; margin-bottom: 8px; page-break-inside: avoid; }
  .section-header { background: #e8e8e8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 8px; border-bottom: 1px solid #000; }
  .field-table { width: 100%; border-collapse: collapse; }
  .field-table td { padding: 5px 8px; border: 1px solid #ccc; font-size: 10px; }
  .field-label { width: 22%; font-weight: 700; font-size: 9px; text-transform: uppercase; background: #f5f5f5; letter-spacing: 0.3px; }
  .field-value { width: 28%; }
  .field-label-half { width: 15%; font-weight: 700; font-size: 9px; text-transform: uppercase; background: #f5f5f5; letter-spacing: 0.3px; }
  .field-value-half { width: 35%; }
  .text-field { border: 1px solid #ccc; margin: 0; }
  .text-field-label { font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; background: #f5f5f5; border-bottom: 1px solid #ccc; letter-spacing: 0.3px; }
  .text-field-content { padding: 5px 8px; font-size: 10px; line-height: 1.5; }
  .desc-img { margin: 4px 0; }
  .desc-img img { max-width: 100%; height: auto; max-height: 300px; display: block; }
  .comment-block { border: 1px solid #ccc; margin: 6px 8px; page-break-inside: avoid; }
  .comment-header { background: #f0f0f0; padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; }
  .comment-author { font-weight: 700; font-size: 9px; }
  .comment-date { font-size: 8px; color: #666; }
  .comment-body { padding: 6px 8px; font-size: 9px; line-height: 1.5; }
  .comment-body p { margin-bottom: 4px; white-space: pre-wrap; }
  .comment-img { margin: 4px 0; }
  .comment-img img { max-width: 100%; height: auto; max-height: 200px; display: block; }
  .footer { border-top: 3px double #000; margin-top: 10px; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8px; color: #555; }
  .footer-center { font-style: italic; text-transform: uppercase; letter-spacing: 0.5px; }
  @media print {
    body { padding: 0; }
    .section { page-break-inside: avoid; }
    .comment-block { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="header-row">
    <div class="header-left">
      <div class="company-name">${appSettings.app_name || "IT Asset Management"}</div>
      <div class="tagline">${appSettings.tagline || ""}</div>
    </div>
    <div class="header-right">
      <div><span class="label">Doc Ref:</span> ${ticket.ticket_no}</div>
    </div>
  </div>
  <hr class="double-hr" />
  <div class="form-title">IT SUPPORT TICKET</div>
  <div class="form-subtitle">Incident Report &amp; Resolution Form</div>
  <hr class="double-hr" />

  <div class="section">
    <div class="section-header">Section 1 — Ticket Information</div>
    <table class="field-table"><tbody>
      <tr>
        <td class="field-label">Ticket Number</td><td class="field-value">${ticket.ticket_no}</td>
        <td class="field-label">Date Created</td><td class="field-value">${formatInAppTimezone(ticket.created_at, "dd-MMM-yyyy", appSettings.timezone)}</td>
      </tr>
      <tr>
        <td class="field-label">Status</td><td class="field-value">${ticket.status}</td>
        <td class="field-label">Time Created</td><td class="field-value">${formatInAppTimezone(ticket.created_at, "hh:mm a", appSettings.timezone)}</td>
      </tr>
      <tr>
        <td class="field-label">Priority</td><td class="field-value">${ticket.priority}</td>
        <td class="field-label">Category</td><td class="field-value">${ticket.category_name || "N/A"}</td>
      </tr>
      <tr>
        <td class="field-label">Department</td><td class="field-value" colspan="3">${ticket.department_name || "N/A"}</td>
      </tr>
      ${
        ticket.status === "Resolved" || ticket.status === "Closed"
          ? `
      <tr>
        <td class="field-label">Date Closed</td><td class="field-value" colspan="3">${ticket.updated_at ? formatInAppTimezone(ticket.updated_at, "dd-MMM-yyyy hh:mm a", appSettings.timezone) : "N/A"}</td>
      </tr>`
          : ""
      }
    </tbody></table>
  </div>

  <div class="section">
    <div class="section-header">Section 2 — Requester Details</div>
    <table class="field-table"><tbody>
      <tr>
        <td class="field-label">Full Name</td><td class="field-value">${ticket.name}</td>
        <td class="field-label">Email Address</td><td class="field-value">${ticket.email}</td>
      </tr>
      <tr>
        <td class="field-label">Assigned Technician</td><td class="field-value" colspan="3">${ticket.assigned_to_name || "Unassigned"}</td>
      </tr>
    </tbody></table>
  </div>

  ${assetSection}

  <div class="section">
    <div class="section-header">${descSectionNum} — Issue Description</div>
    <div class="text-field">
      <div class="text-field-label">Subject</div>
      <div class="text-field-content" style="font-weight:600;">${ticket.title}</div>
    </div>
    <div class="text-field">
      <div class="text-field-label">Description</div>
      <div class="text-field-content">${ticket.description}</div>
      ${ticket.description.includes("<img") ? "" : ""}
    </div>
  </div>

  ${conversationHtml}

  <div class="footer">
    <span>Printed: ${formatInAppTimezone(new Date(), "dd-MMM-yyyy h:mm a", appSettings.timezone)}</span>
    <span class="footer-center">CONFIDENTIAL — For Internal Use Only</span>
  </div>
  <hr class="double-hr" />
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
            Ticket Details
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
            Ticket Details
          </h1>
        </div>
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
  const timeAgo = formatDistanceToNow(new Date(ticket.created_at), {
    addSuffix: true,
  });

  return (
    <PageGuard pagePath="/tickets">
      {/* ===== PRINT-ONLY CORPORATE FORM ===== */}
      <div className="print-page print-only">
        <div className="pf-header">
          <div className="pf-header-top">
            <div className="pf-logo-box">LOGO</div>
            <div className="pf-header-center">
              <div className="pf-company-name">[Company Name]</div>
              <div className="pf-department">
                Information Technology Department
              </div>
            </div>
            <div className="pf-doc-meta">
              <div className="pf-doc-row">
                <span className="pf-doc-label">Doc Ref:</span> IT-TICKET-
                {ticket.ticket_no}
              </div>
              <div className="pf-doc-row">
                <span className="pf-doc-label">Rev:</span> 1.0
              </div>
              <div className="pf-doc-row">
                <span className="pf-doc-label">Page:</span> 1 of 1
              </div>
            </div>
          </div>
          <hr className="pf-hr-double" />
          <div className="pf-form-title">IT SUPPORT TICKET</div>
          <div className="pf-form-subtitle">
            Incident Report &amp; Resolution Form
          </div>
          <hr className="pf-hr-double" />
        </div>

        <div className="pf-section">
          <div className="pf-section-header">
            Section 1 — Ticket Information
          </div>
          <table className="pf-table">
            <tbody>
              <tr>
                <td className="pf-tl">Ticket Number</td>
                <td className="pf-tr">{ticket.ticket_no}</td>
                <td className="pf-tl">Date Created</td>
                <td className="pf-tr">
                  {formatInAppTimezone(ticket.created_at, "dd-MMM-yyyy", appSettings.timezone)}
                </td>
              </tr>
              <tr>
                <td className="pf-tl">Status</td>
                <td className="pf-tr">{ticket.status}</td>
                <td className="pf-tl">Time Created</td>
                <td className="pf-tr">
                  {formatInAppTimezone(ticket.created_at, "hh:mm a", appSettings.timezone)}
                </td>
              </tr>
              <tr>
                <td className="pf-tl">Priority</td>
                <td className="pf-tr">{ticket.priority}</td>
                <td className="pf-tl">Category</td>
                <td className="pf-tr">{ticket.category_name || "N/A"}</td>
              </tr>
              <tr>
                <td className="pf-tl">Department</td>
                <td className="pf-tr" colSpan={3}>
                  {ticket.department_name || "N/A"}
                </td>
              </tr>
              {(ticket.status === "Resolved" || ticket.status === "Closed") && (
                <tr>
                  <td className="pf-tl">Date Closed</td>
                  <td className="pf-tr">
                    {ticket.updated_at
                      ? formatInAppTimezone(
                          ticket.updated_at,
                          "dd-MMM-yyyy hh:mm a",
                          appSettings.timezone,
                        )
                      : "N/A"}
                  </td>
                  <td className="pf-tl"></td>
                  <td className="pf-tr"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pf-section">
          <div className="pf-section-header">Section 2 — Requester Details</div>
          <table className="pf-table">
            <tbody>
              <tr>
                <td className="pf-tl">Full Name</td>
                <td className="pf-tr">{ticket.name}</td>
                <td className="pf-tl">Email Address</td>
                <td className="pf-tr">{ticket.email}</td>
              </tr>
              <tr>
                <td className="pf-tl">Assigned Technician</td>
                <td className="pf-tr" colSpan={3}>
                  {ticket.assigned_to_name || "Unassigned"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {ticket.asset_name && (
          <div className="pf-section">
            <div className="pf-section-header">
              Section 3 — Asset Information
            </div>
            <table className="pf-table">
              <tbody>
                <tr>
                  <td className="pf-tl">Asset Name</td>
                  <td className="pf-tr">{ticket.asset_name}</td>
                  <td className="pf-tl"></td>
                  <td className="pf-tr"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="pf-section">
          <div className="pf-section-header">
            {ticket.asset_name ? "Section 4" : "Section 3"} — Issue Description
          </div>
          <div className="pf-field-box">
            <div className="pf-field-label">Subject</div>
            <div className="pf-field-content pf-bold">{ticket.title}</div>
          </div>
          <div className="pf-field-box">
            <div className="pf-field-label">Description</div>
            <div
              className="pf-field-content"
              dangerouslySetInnerHTML={{ __html: ticket.description }}
            />
          </div>
        </div>

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="pf-section">
            <div className="pf-section-header">
              {ticket.asset_name ? "Section 5" : "Section 4"} — Attachments
            </div>
            <table className="pf-table pf-table-full">
              <thead>
                <tr>
                  <th className="pf-th" style={{ width: 30 }}>
                    #
                  </th>
                  <th className="pf-th">Filename</th>
                </tr>
              </thead>
              <tbody>
                {ticket.attachments.map((url, index) => (
                  <tr key={index}>
                    <td className="pf-td-center">{index + 1}</td>
                    <td className="pf-td">{url.split("/").pop()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {comments.length > 0 && (
          <div className="pf-section">
            <div className="pf-section-header">
              {ticket.asset_name ? "Section 6" : "Section 5"} — Work Log
            </div>
            <table className="pf-table pf-table-full">
              <thead>
                <tr>
                  <th className="pf-th" style={{ width: 130 }}>
                    Date &amp; Time
                  </th>
                  <th className="pf-th" style={{ width: 120 }}>
                    Personnel
                  </th>
                  <th className="pf-th">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment.id}>
                    <td className="pf-td">
                      {formatInAppTimezone(
                        comment.created_at,
                        "dd-MMM-yyyy hh:mm a",
                        appSettings.timezone,
                      )}
                    </td>
                    <td className="pf-td">
                      {comment.created_by_name || "Unknown"}
                    </td>
                    <td
                      className="pf-td"
                      dangerouslySetInnerHTML={{ __html: comment.message }}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pf-section pf-no-break">
          <div className="pf-section-header">Approvals &amp; Signatures</div>
          <div className="pf-signature-grid">
            <div className="pf-sig-block">
              <div className="pf-sig-line"></div>
              <div className="pf-sig-role">Requested By</div>
              <div className="pf-sig-name">{ticket.name}</div>
              <div className="pf-sig-date">Date: _______________</div>
            </div>
            <div className="pf-sig-block">
              <div className="pf-sig-line"></div>
              <div className="pf-sig-role">Assigned To</div>
              <div className="pf-sig-name">
                {ticket.assigned_to_name || "N/A"}
              </div>
              <div className="pf-sig-date">Date: _______________</div>
            </div>
            <div className="pf-sig-block">
              <div className="pf-sig-line"></div>
              <div className="pf-sig-role">Verified By</div>
              <div className="pf-sig-name">Supervisor</div>
              <div className="pf-sig-date">Date: _______________</div>
            </div>
            <div className="pf-sig-block">
              <div className="pf-sig-line"></div>
              <div className="pf-sig-role">Closed By</div>
              <div className="pf-sig-name">IT Support</div>
              <div className="pf-sig-date">Date: _______________</div>
            </div>
          </div>
        </div>

        <div className="pf-footer">
          <div className="pf-footer-left">
            <span className="pf-footer-label">Printed:</span>{" "}
            {formatInAppTimezone(new Date(), "dd-MMM-yyyy h:mm a", appSettings.timezone)}
          </div>
          <div className="pf-footer-center">
            CONFIDENTIAL — For Internal Use Only
          </div>
          <div className="pf-footer-right">Page 1 of 1</div>
        </div>
        <hr className="pf-hr-double" />
      </div>

      {/* ===== SCREEN-ONLY LAYOUT ===== */}
      <div className="space-y-4 sm:space-y-6 hide-print">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden gap-1 mb-4"
          onClick={() => router.push("/tickets")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left — Main Content */}
          <div className="space-y-6">
            {/* Ticket Header + Description */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#1a1f36]">
                {ticket.title}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 text-sm text-[#64748b]">
                <span>
                  Contact:{" "}
                  <span className="font-medium text-[#1a1f36]">
                    {ticket.name}
                  </span>
                </span>
                <span className="hidden sm:inline">&middot;</span>
                <span>{ticket.email}</span>
                <span className="hidden sm:inline">&middot;</span>
                <span>{timeAgo}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                <div
                  className="prose prose-sm max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: ticket.description }}
                />
              </div>
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Attachments
                  </p>
                  <div className="space-y-2">
                    {ticket.attachments.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <ImageIcon className="h-4 w-4 text-[#3b82f6] shrink-0" />
                        ) : (
                          <Paperclip className="h-4 w-4 text-[#64748b] shrink-0" />
                        )}
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3b82f6] hover:underline truncate"
                        >
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
                  Note: This ticket is assigned to{" "}
                  <span className="font-semibold">
                    {ticket.assigned_to_name}
                  </span>
                </p>
              </div>
            )}

            {/* Comments Thread */}
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white shadow-sm rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="size-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-medium">
                        {comment.created_by_name
                          ? comment.created_by_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1f36]">
                          {comment.created_by_name || "Unknown"}
                        </p>
                        <p className="text-xs text-[#64748b]">
                          {formatInAppTimezone(
                            comment.created_at,
                            "MMM dd, yyyy 'at' h:mm a",
                            appSettings.timezone,
                          )}
                        </p>
                      </div>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: comment.message }}
                    />
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                        <div className="space-y-1">
                          {comment.attachments.map((url, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <ImageIcon className="h-4 w-4 text-[#3b82f6] shrink-0" />
                              ) : (
                                <Paperclip className="h-4 w-4 text-[#64748b] shrink-0" />
                              )}
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#3b82f6] hover:underline truncate"
                              >
                                {url.split("/").pop()}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reply / Comment Input */}
            {(ticket.status === "Open" || ticket.status === "In Progress") && (
              <div className="bg-white shadow-sm rounded-xl p-6">
                <p className="text-sm font-medium text-[#1a1f36] mb-4">Reply</p>
                <RichTextEditor
                  key={editorKey}
                  content={replyContent}
                  onChange={setReplyContent}
                  onImageUpload={handleRichTextImageUpload}
                  placeholder="Type your message"
                />
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 text-sm bg-[#f8fafc] rounded-md px-3 py-1.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="h-4 w-4 text-[#3b82f6] shrink-0" />
                          ) : (
                            <Paperclip className="h-4 w-4 text-[#64748b] shrink-0" />
                          )}
                          <span className="truncate text-[#1a1f36]">
                            {file.name}
                          </span>
                          <span className="text-xs text-[#64748b] shrink-0">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-[#64748b] hover:text-red-500 shrink-0 text-xs"
                          onClick={() => removeAttachment(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div
                    className="flex items-center gap-2 text-sm text-[#64748b] cursor-pointer hover:text-[#1a1f36]"
                    onClick={() => attachmentInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Attachment</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Button
                      size="sm"
                      className="gap-2 w-full sm:w-auto"
                      onClick={() => handleSubmitComment()}
                      disabled={
                        submitting ||
                        uploadingFiles ||
                        (!replyContent.trim() && attachments.length === 0)
                      }
                    >
                      <Send className="h-4 w-4" />
                      {submitting
                        ? uploadingFiles
                          ? "Uploading..."
                          : "Submitting..."
                        : "Submit"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                      onClick={() => handleSubmitComment(true)}
                      disabled={
                        submitting ||
                        uploadingFiles ||
                        (!replyContent.trim() && attachments.length === 0)
                      }
                    >
                      <Send className="h-4 w-4" />
                      Submit as Resolved
                    </Button>
                  </div>
                </div>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAttachmentUpload}
                />
              </div>
            )}
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Action Buttons */}
            <div className="bg-white shadow-sm rounded-xl p-4">
              <div className="grid grid-cols-2 gap-2">
                {canEdit && (
                  <Button
                    size="sm"
                    className="gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                <Button
                  size="sm"
                  className="gap-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                {canEdit && (
                  <Button
                    size="sm"
                    className="gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                    onClick={() => setStatusModalOpen(true)}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Status
                  </Button>
                )}
                {canAssign && (
                  <Button
                    size="sm"
                    className="gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                    onClick={() => setAssignModalOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign
                  </Button>
                )}
              </div>
            </div>

            {/* Ticket Metadata */}
            <div className="bg-white shadow-sm rounded-xl p-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Ticket status
                </p>
                <div className="flex items-center gap-2">
                  <Badge className={`${sConfig.bg} ${sConfig.text} border-0`}>
                    <span
                      className={`size-1.5 rounded-full ${sConfig.dot} mr-1`}
                    />
                    {ticket.status}
                  </Badge>
                  {ticket.status !== "Resolved" &&
                    ticket.status !== "Closed" && (
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
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Category
                </p>
                <p className="text-sm font-medium text-[#1a1f36]">
                  {ticket.category_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Department
                </p>
                <p className="text-sm font-medium text-[#1a1f36]">
                  {ticket.department_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Priority
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pConfig.bg} ${pConfig.text}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Assigned to
                </p>
                <p className="text-sm font-medium text-[#1a1f36]">
                  {ticket.assigned_to_name || "Unassigned"}
                </p>
              </div>
            </div>

            {/* Asset Details (Collapsible) */}
            {ticket.asset_id && (
              <Collapsible open={assetDetailsOpen} onOpenChange={setAssetDetailsOpen}>
                <div className="bg-white shadow-sm rounded-xl">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                    <h3 className="text-sm font-semibold text-[#1a1f36]">
                      Asset Details
                    </h3>
                    {assetDetailsOpen ? (
                      <ChevronDown className="h-4 w-4 text-[#64748b]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[#64748b]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">
                          Asset name
                        </span>
                        <span className="text-sm font-medium text-[#1a1f36]">
                          {ticket.asset_name || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">
                          Serial number
                        </span>
                        <span className="text-sm font-medium text-[#1a1f36]">
                          {assetDetails?.serial_number || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">
                          Brand
                        </span>
                        <span className="text-sm font-medium text-[#1a1f36]">
                          {assetDetails?.item_brand || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">
                          Model
                        </span>
                        <span className="text-sm font-medium text-[#1a1f36]">
                          {assetDetails?.item_model || "N/A"}
                        </span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Ticket Details (Collapsible) */}
            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
              <div className="bg-white shadow-sm rounded-xl">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                  <h3 className="text-sm font-semibold text-[#1a1f36]">
                    Ticket Details
                  </h3>
                  {detailsOpen ? (
                    <ChevronDown className="h-4 w-4 text-[#64748b]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#64748b]" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-[#64748b]">
                        Ticket number
                      </span>
                      <span className="text-sm font-medium text-[#1a1f36]">
                        {ticket.ticket_no}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-[#64748b]">Created on</span>
                      <span className="text-sm text-[#1a1f36]">
                        {formatInAppTimezone(
                          ticket.created_at,
                          "yyyy-MM-dd HH:mm:ss",
                          appSettings.timezone,
                        )}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-[#64748b]">Created by</span>
                      <span className="text-sm text-[#1a1f36]">
                        {ticket.created_by_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-[#64748b]">Updated</span>
                      <span className="text-sm text-[#1a1f36]">
                        {ticket.updated_at
                          ? formatInAppTimezone(
                              ticket.updated_at,
                              "yyyy-MM-dd HH:mm:ss",
                              appSettings.timezone,
                            )
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-[#64748b]">Replies</span>
                      <span className="text-sm text-[#1a1f36]">
                        {commentTotal}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-[#64748b]">
                        Last replier
                      </span>
                      <span className="text-sm text-[#1a1f36]">
                        {comments.length > 0
                          ? comments[comments.length - 1].created_by_name ||
                            "Unknown"
                          : "N/A"}
                      </span>
                    </div>
                    {ticket.asset_status && (
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-[#64748b]">
                          Asset status before repair
                        </span>
                        <span className="text-sm font-medium text-[#1a1f36]">
                          {ticket.asset_status}
                        </span>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Ticket History */}
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <div className="bg-white shadow-sm rounded-xl">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                  <h3 className="text-sm font-semibold text-[#1a1f36]">
                    Ticket History
                  </h3>
                  {historyOpen ? (
                    <ChevronDown className="h-4 w-4 text-[#64748b]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#64748b]" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    {statusLogs.length === 0 ? (
                      <p className="text-sm text-[#64748b]">No history yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {statusLogs.map((log) => {
                          const logStatusConfig: Record<
                            string,
                            { bg: string; text: string }
                          > = {
                            Open: {
                              bg: "bg-[#dbeafe]",
                              text: "text-[#1d4ed8]",
                            },
                            "In Progress": {
                              bg: "bg-[#fef3c7]",
                              text: "text-[#b45309]",
                            },
                            Resolved: {
                              bg: "bg-[#d1fae5]",
                              text: "text-[#059669]",
                            },
                            Closed: {
                              bg: "bg-[#e2e8f0]",
                              text: "text-[#475569]",
                            },
                            Deleted: {
                              bg: "bg-[#fee2e2]",
                              text: "text-[#dc2626]",
                            },
                          };
                          const cfg =
                            logStatusConfig[log.new_status] ||
                            logStatusConfig.Open;
                          return (
                            <div
                              key={log.id}
                              className="flex items-start gap-3 text-sm"
                            >
                              <span
                                className={`inline-flex items-center shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
                              >
                                {log.new_status}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[#1a1f36]">{log.remarks}</p>
                                <p className="text-xs text-[#64748b] mt-0.5">
                                  {formatInAppTimezone(
                                    log.created_at,
                                    "MMM dd, yyyy HH:mm",
                                    appSettings.timezone,
                                  )}
                                  {log.created_by_name &&
                                    ` by ${log.created_by_name}`}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {statusLogs.length < logTotal && (
                          <button
                            onClick={handleLoadMoreLogs}
                            disabled={logsLoading}
                            className="w-full text-center text-sm text-[#3b82f6] hover:underline py-2 disabled:opacity-50"
                          >
                            {logsLoading
                              ? "Loading..."
                              : `Load more (${statusLogs.length} of ${logTotal})`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Modals */}
      <div className="no-print">
        <TicketUpdateStatusModal
          open={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          currentStatus={ticket.status}
          onConfirm={handleStatusUpdate}
        />
        <TicketAssignModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          users={selectOptions.users}
          currentAssignedTo={ticket.assigned_to}
          onConfirm={handleAssign}
        />
        <TicketEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          ticket={ticket}
          selectOptions={selectOptions}
          onConfirm={handleEditConfirm}
        />
        <AlertDialog
          open={resolveConfirmOpen}
          onOpenChange={setResolveConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as Resolved</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this ticket as resolved? This will
                change the status to &quot;Resolved&quot;.
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
      </div>

      <style jsx global>{`
        .print-only {
          display: none !important;
        }
        @media print {
          .print-only {
            display: block !important;
          }
          .hide-print {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          nav,
          header,
          aside,
          [class*="sidebar"],
          [class*="Sidebar"],
          [data-sidebar] {
            display: none !important;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-page {
            display: block !important;
            font-family: "Arial", "Helvetica Neue", sans-serif;
            font-size: 10px;
            color: #1a1a1a;
            line-height: 1.4;
          }

          .pf-header-top {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .pf-logo-box {
            width: 60px;
            height: 60px;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 700;
            color: #666;
            flex-shrink: 0;
          }
          .pf-header-center {
            flex: 1;
          }
          .pf-company-name {
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }
          .pf-department {
            font-size: 10px;
            color: #555;
            margin-top: 1px;
          }
          .pf-doc-meta {
            text-align: right;
            font-size: 9px;
            line-height: 1.5;
            flex-shrink: 0;
          }
          .pf-doc-label {
            font-weight: 700;
          }
          .pf-hr-double {
            border: none;
            border-top: 3px double #000;
            margin: 6px 0;
          }
          .pf-form-title {
            text-align: center;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin: 4px 0 2px;
          }
          .pf-form-subtitle {
            text-align: center;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #555;
            margin: 0 0 4px;
          }

          .pf-section {
            border: 1px solid #000;
            margin-bottom: 8px;
            page-break-inside: avoid;
          }
          .pf-section-header {
            background: #e8e8e8;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 4px 8px;
            border-bottom: 1px solid #000;
          }
          .pf-table {
            width: 100%;
            border-collapse: collapse;
          }
          .pf-table-full {
            width: 100%;
            border-collapse: collapse;
          }
          .pf-tl {
            width: 22%;
            font-weight: 700;
            font-size: 9px;
            text-transform: uppercase;
            padding: 5px 8px;
            background: #f5f5f5;
            border: 1px solid #ccc;
            letter-spacing: 0.3px;
          }
          .pf-tr {
            width: 28%;
            font-size: 10px;
            padding: 5px 8px;
            border: 1px solid #ccc;
          }
          .pf-th {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 4px 8px;
            background: #e8e8e8;
            border: 1px solid #ccc;
            text-align: left;
            letter-spacing: 0.3px;
          }
          .pf-td {
            font-size: 10px;
            padding: 4px 8px;
            border: 1px solid #ccc;
            vertical-align: top;
          }
          .pf-td-center {
            font-size: 10px;
            padding: 4px 8px;
            border: 1px solid #ccc;
            text-align: center;
          }

          .pf-field-box {
            border: 1px solid #ccc;
            margin: 0;
          }
          .pf-field-box + .pf-field-box {
            border-top: none;
          }
          .pf-field-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 3px 8px;
            background: #f5f5f5;
            border-bottom: 1px solid #ccc;
            letter-spacing: 0.3px;
          }
          .pf-field-content {
            padding: 5px 8px;
            font-size: 10px;
            line-height: 1.5;
            min-height: 14px;
          }
          .pf-bold {
            font-weight: 600;
          }

          .pf-signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
          }
          .pf-sig-block {
            padding: 12px 16px;
            border: 1px solid #ccc;
            text-align: center;
          }
          .pf-sig-line {
            border-bottom: 1px solid #000;
            height: 32px;
            margin-bottom: 4px;
          }
          .pf-sig-role {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .pf-sig-name {
            font-size: 9px;
            color: #555;
            margin-top: 2px;
          }
          .pf-sig-date {
            font-size: 9px;
            color: #555;
            margin-top: 2px;
          }

          .pf-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8px;
            color: #555;
            padding-top: 6px;
            margin-top: 4px;
          }
          .pf-footer-label {
            font-weight: 700;
          }
          .pf-footer-center {
            font-style: italic;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .pf-no-break {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </PageGuard>
  );
}
