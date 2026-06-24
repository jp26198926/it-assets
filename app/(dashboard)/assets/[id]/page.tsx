"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Edit,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PageGuard } from "@/components/auth/page-guard";
import { AssignmentFormModal } from "@/components/modals/assignment-form-modal";
import { getAssetById } from "@/lib/actions/asset-actions";
import { getAssignments, createAssignment } from "@/lib/actions/assignment-actions";
import { getTickets } from "@/lib/actions/ticket-actions";
import { useBreadcrumbOverrides } from "@/components/layout/breadcrumb-override-context";
import type { Asset } from "@/lib/types/asset";
import type { Assignment, CreateAssignmentInput } from "@/lib/types/assignment";
import type { Ticket } from "@/lib/types/ticket";
import { toast } from "sonner";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Available: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Assigned: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Repair: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Lost: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  Disposed: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  Deleted: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const assignmentStatusConfig: Record<string, { bg: string; text: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Returned: { bg: "bg-blue-50", text: "text-blue-700" },
  Lost: { bg: "bg-rose-50", text: "text-rose-700" },
};

const ticketStatusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Open: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]", dot: "bg-[#1d4ed8]" },
  "In Progress": { bg: "bg-[#fef3c7]", text: "text-[#b45309]", dot: "bg-[#b45309]" },
  Resolved: { bg: "bg-[#d1fae5]", text: "text-[#059669]", dot: "bg-[#059669]" },
  Closed: { bg: "bg-[#e2e8f0]", text: "text-[#475569]", dot: "bg-[#475569]" },
  Deleted: { bg: "bg-[#fee2e2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
};

const priorityConfig: Record<string, { bg: string; text: string }> = {
  Low: { bg: "bg-blue-50", text: "text-blue-700" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700" },
  High: { bg: "bg-orange-50", text: "text-orange-700" },
  Critical: { bg: "bg-red-50", text: "text-red-700" },
};

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setOverrides: setBreadcrumbOverrides } = useBreadcrumbOverrides();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [assignmentsOpen, setAssignmentsOpen] = useState(true);
  const [ticketsOpen, setTicketsOpen] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assetId = params.id as string;
        const [assetData, assignmentData, ticketData] = await Promise.all([
          getAssetById(assetId),
          getAssignments({ asset_id: assetId }),
          getTickets({ asset_id: assetId }),
        ]);

        if (assetData) {
          setAsset(assetData);
          setBreadcrumbOverrides({ [assetId]: assetData.barcode });
        } else {
          setError(true);
        }

        setAssignments(assignmentData);
        setTickets(ticketData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleAssignSubmit = async (data: CreateAssignmentInput) => {
    try {
      await createAssignment(data);
      toast.success("Assignment has been added");
      setAssignModalOpen(false);
      if (asset) {
        const [updatedAsset, updatedAssignments] = await Promise.all([
          getAssetById(asset.id),
          getAssignments({ asset_id: asset.id }),
        ]);
        if (updatedAsset) setAsset(updatedAsset);
        setAssignments(updatedAssignments);
      }
    } catch {
      toast.error("Failed to create assignment");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
            Asset Details
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading asset...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
            Asset Details
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-[#64748b] mb-4">Asset not found</p>
            <Button variant="outline" onClick={() => router.push("/assets")}>
              Back to Assets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sConfig = statusConfig[asset.status] || statusConfig.Available;
  const timeAgo = formatDistanceToNow(new Date(asset.created_at), { addSuffix: true });

  return (
    <PageGuard pagePath="/assets">
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left — Main Content */}
          <div className="space-y-6">
            {/* Asset Header */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center bg-[#f0f4f8] rounded-xl">
                  <Package className="h-6 w-6 text-[#64748b]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1a1f36] font-mono">
                    {asset.barcode}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sConfig.bg} ${sConfig.text}`}
                    >
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
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-[#64748b]">
                {asset.assigned_to_employee_name && (
                  <>
                    <span>
                      Assigned to{" "}
                      <span className="font-medium text-[#1a1f36]">
                        {asset.assigned_to_employee_name}
                      </span>
                    </span>
                    <span>&middot;</span>
                  </>
                )}
                <span>{timeAgo}</span>
              </div>
            </div>

            {/* Asset Details */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[#1a1f36] mb-4">
                Asset Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Item</p>
                    <p className="text-sm mt-1">{asset.item_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Item Code</p>
                    <p className="text-sm font-mono mt-1">{asset.item_code || "N/A"}</p>
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
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Remarks</p>
                    <p className="text-sm mt-1">{asset.remarks || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date Received</p>
                    <p className="text-sm mt-1 tabular-nums">
                      {asset.date_received
                        ? format(new Date(asset.date_received), "MMMM dd, yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Brand</p>
                    <p className="text-sm mt-1">{asset.item_brand || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Model</p>
                    <p className="text-sm mt-1">{asset.item_model || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
                    <p className="text-sm mt-1">{asset.item_description || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unit of Measure</p>
                    <p className="text-sm mt-1">{asset.item_uom || "N/A"}</p>
                  </div>
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
            </div>

            {/* Audit Fields */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[#1a1f36] mb-4">
                Audit Details
              </h3>
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
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Action Buttons */}
            <div className="bg-white shadow-sm rounded-xl p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => router.push("/assets")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                {asset.status === "Available" && (
                  <Button
                    size="sm"
                    className="gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    onClick={() => setAssignModalOpen(true)}
                  >
                    Assign
                  </Button>
                )}
              </div>
            </div>

            {/* Asset Metadata */}
            <div className="bg-white shadow-sm rounded-xl p-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Status
                </p>
                <Badge className={`${sConfig.bg} ${sConfig.text} border-0`}>
                  <span className={`size-1.5 rounded-full ${sConfig.dot} mr-1`} />
                  {asset.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Category
                </p>
                <p className="text-sm font-medium text-[#1a1f36]">
                  {asset.item_category_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="text-sm font-medium text-[#1a1f36]">
                  {asset.location_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Assigned To
                </p>
                <p className="text-sm font-medium text-[#1a1f36]">
                  {asset.assigned_to_employee_name || "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Department
                </p>
                <p className="text-sm font-medium text-[#1a1f36]">
                  {asset.assigned_to_department_name || "N/A"}
                </p>
              </div>
            </div>

            {/* Assignment History */}
            <Collapsible open={assignmentsOpen} onOpenChange={setAssignmentsOpen}>
              <div className="bg-white shadow-sm rounded-xl">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                  <h3 className="text-sm font-semibold text-[#1a1f36]">
                    Assignment History
                  </h3>
                  {assignmentsOpen ? (
                    <ChevronDown className="h-4 w-4 text-[#64748b]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#64748b]" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    {assignments.length === 0 ? (
                      <p className="text-sm text-[#64748b]">No assignment history.</p>
                    ) : (
                      <div className="space-y-3">
                        {assignments.map((a) => {
                          const aConfig = assignmentStatusConfig[a.status] || assignmentStatusConfig.Active;
                          return (
                            <div key={a.id} className="border border-[#e2e8f0] rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-[#1a1f36]">
                                  {a.employee_name || "N/A"}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${aConfig.bg} ${aConfig.text}`}
                                >
                                  {a.status}
                                </span>
                              </div>
                              <div className="text-xs text-[#64748b] space-y-1">
                                {a.department_name && (
                                  <p>Dept: {a.department_name}</p>
                                )}
                                <p>
                                  Assigned: {format(new Date(a.assigned_date), "MMM dd, yyyy")}
                                </p>
                                {a.returned_date && (
                                  <p>
                                    Returned: {format(new Date(a.returned_date), "MMM dd, yyyy")}
                                  </p>
                                )}
                                {a.condition_on_issue && (
                                  <p>Condition on issue: {a.condition_on_issue}</p>
                                )}
                                {a.condition_on_return && (
                                  <p>Condition on return: {a.condition_on_return}</p>
                                )}
                                {a.status === "Lost" && a.date_lost && (
                                  <p>Date lost: {format(new Date(a.date_lost), "MMM dd, yyyy")}</p>
                                )}
                                {a.status === "Lost" && a.lost_reason && (
                                  <p className="text-rose-600">Lost reason: {a.lost_reason}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Ticket History */}
            <Collapsible open={ticketsOpen} onOpenChange={setTicketsOpen}>
              <div className="bg-white shadow-sm rounded-xl">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                  <h3 className="text-sm font-semibold text-[#1a1f36]">
                    Ticket History
                  </h3>
                  {ticketsOpen ? (
                    <ChevronDown className="h-4 w-4 text-[#64748b]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#64748b]" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    {tickets.length === 0 ? (
                      <p className="text-sm text-[#64748b]">No tickets linked to this asset.</p>
                    ) : (
                      <div className="space-y-3">
                        {tickets.map((t) => {
                          const tConfig = ticketStatusConfig[t.status] || ticketStatusConfig.Open;
                          const pConfig = priorityConfig[t.priority] || priorityConfig.Low;
                          return (
                            <div
                              key={t.id}
                              className="border border-[#e2e8f0] rounded-lg p-3 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                              onClick={() => router.push(`/tickets/${t.id}`)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-mono text-[#64748b]">
                                  {t.ticket_no}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tConfig.bg} ${tConfig.text}`}
                                >
                                  <span className={`size-1.5 rounded-full ${tConfig.dot}`} />
                                  {t.status}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-[#1a1f36] truncate">
                                {t.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pConfig.bg} ${pConfig.text}`}
                                >
                                  {t.priority}
                                </span>
                                <span className="text-xs text-[#64748b]">
                                  {format(new Date(t.created_at), "MMM dd, yyyy")}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </div>
      </div>

      <AssignmentFormModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        defaultAssetId={asset?.id}
        onSubmit={handleAssignSubmit}
      />
    </PageGuard>
  );
}
