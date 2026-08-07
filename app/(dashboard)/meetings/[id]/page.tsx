"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatInAppTimezone } from "@/lib/utils/timezone";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Users,
  FileText,
  ExternalLink,
  Paperclip,
  Save,
  Pencil,
  X,
  ClipboardCheck,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle,
  Upload,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { PageGuard } from "@/components/auth/page-guard";
import { useAuthorization } from "@/hooks/use-authorization";
import { getAppSettings } from "@/lib/actions/application-actions";
import { getMeetingById, updateMeeting, getMeetingTypeSelectOptions, addAttendee, updateAttendee, removeAttendee, cloneMeeting } from "@/lib/actions/meeting-actions";
import { getCloudinarySettings } from "@/lib/actions/cloudinary-actions";
import {
  getMeetingActionItems,
  createMeetingActionItem,
  updateMeetingActionItem,
  deleteMeetingActionItem,
  restoreMeetingActionItem,
} from "@/lib/actions/meeting-action-item-actions";
import { getEmployeeList } from "@/lib/actions/employee-actions";
import type { MeetingActionItem, CreateMeetingActionItemInput, UpdateMeetingActionItemInput } from "@/lib/types/meeting-action-item";
import { MeetingEditModal } from "@/components/modals/meeting-edit-modal";
import { MeetingUpdateStatusModal } from "@/components/modals/meeting-update-status-modal";
import { MeetingAgendaModal } from "@/components/modals/meeting-agenda-modal";
import { MeetingCloneModal } from "@/components/modals/meeting-clone-modal";
import type { Meeting, Recurrence, UpdateMeetingInput } from "@/lib/types/meeting";
import type { MeetingTypeSelectOption } from "@/lib/types/meeting";
import { useBreadcrumbOverrides } from "@/components/layout/breadcrumb-override-context";
import { toast } from "sonner";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Scheduled: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-700" },
  "In Progress": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-700" },
  Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-700" },
  Cancelled: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-700" },
  Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-700" },
};

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [editorKey, setEditorKey] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [appTimezone, setAppTimezone] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [agendaModalOpen, setAgendaModalOpen] = useState(false);
  const [meetingTypes, setMeetingTypes] = useState<MeetingTypeSelectOption[]>([]);
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [addActionItemOpen, setAddActionItemOpen] = useState(false);
  const [editActionItem, setEditActionItem] = useState<MeetingActionItem | null>(null);
  const [actionItemForm, setActionItemForm] = useState<CreateMeetingActionItemInput>({
    meeting_id: "",
    title: "",
    description: "",
    assigned_to: "",
    due_date: undefined,
    priority: "Medium",
  });
  const [addAttendeeOpen, setAddAttendeeOpen] = useState(false);
  const [editingAttendeeId, setEditingAttendeeId] = useState<string | null>(null);
  const [newAttendeeEmployeeId, setNewAttendeeEmployeeId] = useState("");
  const [editAttendeeStatus, setEditAttendeeStatus] = useState<string>("Pending");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [cloning, setCloning] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const { setOverrides: setBreadcrumbOverrides } = useBreadcrumbOverrides();
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/meetings", "Edit");

  const fetchActionItems = async (meetingId: string) => {
    try {
      const items = await getMeetingActionItems({ meeting_id: meetingId });
      setActionItems(items);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const meetingId = params.id as string;
        const [data, cloudinarySettings, types, empList, appSettings] = await Promise.all([
          getMeetingById(meetingId),
          getCloudinarySettings(),
          getMeetingTypeSelectOptions(),
          getEmployeeList(),
          getAppSettings(),
        ]);
        if (data) {
          setMeeting(data);
          setNotesContent(data.notes || "");
          setBreadcrumbOverrides({ [meetingId]: `#${data.meeting_no}` });
          fetchActionItems(meetingId);
        } else {
          setError(true);
        }
        setMaxFileSize(cloudinarySettings.max_file_size || 10);
        setMeetingTypes(types);
        setEmployees(empList);
        setAppTimezone(appSettings.timezone);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [params.id]);

  const handleRichTextImageUpload = async (file: File): Promise<string | null> => {
    try {
      const maxBytes = maxFileSize * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(`"${file.name}" exceeds the ${maxFileSize} MB limit.`);
        return null;
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("fileName", file.name);
      const res = await fetch("/api/meetings/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
      toast.error(data.error || "Failed to upload image");
      return null;
    } catch {
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleSaveNotes = async () => {
    if (!meeting) return;
    setSavingNotes(true);
    try {
      await updateMeeting(meeting.id, { notes: notesContent || undefined });
      const refreshed = await getMeetingById(meeting.id);
      if (refreshed) setMeeting(refreshed);
      setEditingNotes(false);
      setEditorKey((k) => k + 1);
      toast.success("Minutes saved successfully");
    } catch {
      toast.error("Failed to save minutes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancelEdit = () => {
    setNotesContent(meeting?.notes || "");
    setEditingNotes(false);
    setEditorKey((k) => k + 1);
  };

  const handleEditConfirm = async (data: {
    title: string;
    description?: string;
    meeting_type_id?: string;
    platform?: string;
    meeting_link?: string;
    location?: string;
    scheduled_date: Date;
    start_time: string;
    end_time?: string;
    is_recurring: boolean;
    recurrence?: Recurrence | null;
  }) => {
    if (!meeting) return;
    try {
      await updateMeeting(meeting.id, data);
      const refreshed = await getMeetingById(meeting.id);
      if (refreshed) setMeeting(refreshed);
      toast.success("Meeting updated successfully");
    } catch {
      toast.error("Failed to update meeting");
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!meeting) return;
    try {
      await updateMeeting(meeting.id, { status: newStatus as UpdateMeetingInput["status"] });
      const refreshed = await getMeetingById(meeting.id);
      if (refreshed) setMeeting(refreshed);
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAddActionItem = async () => {
    if (!meeting || !actionItemForm.title.trim()) return;
    try {
      await createMeetingActionItem({
        ...actionItemForm,
        meeting_id: meeting.id,
        assigned_to: actionItemForm.assigned_to || undefined,
        due_date: actionItemForm.due_date || undefined,
      });
      setAddActionItemOpen(false);
      setActionItemForm({ meeting_id: "", title: "", description: "", assigned_to: "", due_date: undefined, priority: "Medium" });
      fetchActionItems(meeting.id);
      toast.success("Action item added");
    } catch {
      toast.error("Failed to add action item");
    }
  };

  const handleUpdateActionItem = async () => {
    if (!meeting || !editActionItem) return;
    try {
      await updateMeetingActionItem(editActionItem.id, {
        title: actionItemForm.title,
        description: actionItemForm.description || undefined,
        assigned_to: actionItemForm.assigned_to || undefined,
        due_date: actionItemForm.due_date || undefined,
        priority: actionItemForm.priority,
        status: editActionItem.status as UpdateMeetingActionItemInput["status"],
      });
      setEditActionItem(null);
      setActionItemForm({ meeting_id: "", title: "", description: "", assigned_to: "", due_date: undefined, priority: "Medium" });
      fetchActionItems(meeting.id);
      toast.success("Action item updated");
    } catch {
      toast.error("Failed to update action item");
    }
  };

  const handleDeleteActionItem = async (id: string) => {
    if (!meeting) return;
    try {
      await deleteMeetingActionItem(id);
      fetchActionItems(meeting.id);
      toast.success("Action item deleted");
    } catch {
      toast.error("Failed to delete action item");
    }
  };

  const handleRestoreActionItem = async (id: string) => {
    if (!meeting) return;
    try {
      await restoreMeetingActionItem(id);
      fetchActionItems(meeting.id);
      toast.success("Action item restored");
    } catch {
      toast.error("Failed to restore action item");
    }
  };

  const handleCompleteActionItem = async (id: string) => {
    if (!meeting) return;
    try {
      await updateMeetingActionItem(id, { status: "Completed" });
      fetchActionItems(meeting.id);
      toast.success("Action item completed");
    } catch {
      toast.error("Failed to complete action item");
    }
  };

  const openEditActionItem = (item: MeetingActionItem) => {
    setEditActionItem(item);
    setActionItemForm({
      meeting_id: item.meeting_id,
      title: item.title,
      description: item.description || "",
      assigned_to: item.assigned_to || "",
      due_date: item.due_date ? new Date(item.due_date) : undefined,
      priority: item.priority,
    });
  };

  const refreshMeeting = async () => {
    if (!meeting) return;
    const refreshed = await getMeetingById(meeting.id);
    if (refreshed) setMeeting(refreshed);
  };

  const handleAttachmentUpload = async () => {
    if (!pendingFiles.length || !meeting) return;

    setUploadingAttachment(true);
    try {
      const newUrls: string[] = [];
      for (const file of pendingFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("fileName", file.name);
        const res = await fetch("/api/meetings/upload", {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        } else {
          toast.error(data.error || `Failed to upload ${file.name}`);
        }
      }
      if (newUrls.length > 0) {
        await updateMeeting(meeting.id, {
          attachments: [...(meeting.attachments || []), ...newUrls],
        });
        refreshMeeting();
        toast.success("Attachments uploaded");
      }
      setPendingFiles([]);
      setAttachmentModalOpen(false);
    } catch {
      toast.error("Failed to upload attachments");
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleRemoveAttachment = async (index: number) => {
    if (!meeting) return;
    const newAttachments = meeting.attachments.filter((_, i) => i !== index);
    try {
      await updateMeeting(meeting.id, { attachments: newAttachments });
      refreshMeeting();
      toast.success("Attachment removed");
    } catch {
      toast.error("Failed to remove attachment");
    }
  };

  const handleAddAttendee = async () => {
    if (!meeting || !newAttendeeEmployeeId) return;
    try {
      await addAttendee(meeting.id, {
        employee_id: newAttendeeEmployeeId,
        attendance_status: "Pending",
        notes: null,
      });
      setAddAttendeeOpen(false);
      setNewAttendeeEmployeeId("");
      refreshMeeting();
      toast.success("Attendee added");
    } catch {
      toast.error("Failed to add attendee");
    }
  };

  const handleUpdateAttendeeStatus = async (attendeeId: string, status: string) => {
    if (!meeting) return;
    try {
      await updateAttendee(meeting.id, attendeeId, {
        attendance_status: status as "Pending" | "Accepted" | "Declined" | "Tentative" | "Attended" | "Absent",
      });
      setEditingAttendeeId(null);
      refreshMeeting();
      toast.success("Attendee status updated");
    } catch {
      toast.error("Failed to update attendee status");
    }
  };

  const handleRemoveAttendee = async (attendeeId: string) => {
    if (!meeting) return;
    try {
      await removeAttendee(meeting.id, attendeeId);
      refreshMeeting();
      toast.success("Attendee removed");
    } catch {
      toast.error("Failed to remove attendee");
    }
  };

  const handleCloneConfirm = async (data: { scheduled_date: Date; start_time: string; end_time?: string }) => {
    if (!meeting) return;
    setCloning(true);
    try {
      const cloned = await cloneMeeting(meeting.id, data);
      setCloneModalOpen(false);
      toast.success("Meeting cloned successfully");
      router.push(`/meetings/${cloned.id}`);
    } catch {
      toast.error("Failed to clone meeting");
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meeting Details</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meeting Details</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Meeting not found</p>
            <Button variant="outline" onClick={() => router.push("/meetings")}>
              Back to Meetings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sConfig = statusConfig[meeting.status] || statusConfig.Scheduled;

  return (
    <PageGuard pagePath="/meetings">
      <div className="space-y-4 sm:space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden gap-1 mb-4"
          onClick={() => router.push("/meetings")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left — Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1a1f36]">
                    {meeting.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Meeting #{meeting.meeting_no}
                  </p>
                </div>
                <Badge className={`${sConfig.bg} ${sConfig.text} border-0`}>
                  <span className={`size-1.5 rounded-full ${sConfig.dot} mr-1`} />
                  {meeting.status}
                </Badge>
              </div>

              {meeting.description && (
                <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                  <div
                    className="rich-content text-sm"
                    dangerouslySetInnerHTML={{ __html: meeting.description }}
                  />
                </div>
              )}
            </div>

            {/* Agenda Items */}
            {meeting.agenda_items.length > 0 && (
              <div className="bg-white shadow-sm rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#1a1f36]">
                    Agenda Items
                  </h3>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => setAgendaModalOpen(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {meeting.agenda_items.map((item) => (
                    <div key={item.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-[#1a1f36]">
                          {item.topic}
                        </p>
                        {item.duration_minutes && (
                          <span className="text-xs text-muted-foreground">
                            {item.duration_minutes} min
                          </span>
                        )}
                      </div>
                      {item.presenter && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Presenter: {item.presenter}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-sm mt-2">{item.description}</p>
                      )}
                      {item.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Attendee Modal */}
            {addAttendeeOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Add Attendee</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Employee *</label>
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={newAttendeeEmployeeId}
                        onChange={(e) => setNewAttendeeEmployeeId(e.target.value)}
                      >
                        <option value="">Select employee</option>
                        {employees
                          .filter((emp) => !meeting.attendees.some((a) => a.employee_id === emp.id))
                          .map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="p-4 border-t flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setAddAttendeeOpen(false); setNewAttendeeEmployeeId(""); }}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddAttendee} disabled={!newAttendeeEmployeeId}>
                      Add Attendee
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Minutes of Meeting */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#1a1f36]">
                  Minutes of Meeting
                </h3>
                <div className="flex items-center gap-2">
                  {canEdit && !editingNotes && (meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => setEditingNotes(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {editingNotes && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                      >
                        <Save className="h-4 w-4" />
                        {savingNotes ? "Saving..." : "Save"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingNotes ? (
                <RichTextEditor
                  key={editorKey}
                  content={notesContent}
                  onChange={setNotesContent}
                  onImageUpload={handleRichTextImageUpload}
                  placeholder="Record meeting discussion, decisions, and minutes here..."
                />
              ) : meeting.notes ? (
                <div
                  className="rich-content text-sm"
                  dangerouslySetInnerHTML={{ __html: meeting.notes }}
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No minutes recorded yet.
                </p>
              )}
            </div>

            {/* Action Items */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#1a1f36]">
                  Action Items
                </h3>
                {canEdit && (meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setActionItemForm({ meeting_id: meeting.id, title: "", description: "", assigned_to: "", due_date: undefined, priority: "Medium" });
                      setAddActionItemOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                )}
              </div>
              {actionItems.length > 0 ? (
                <div className="space-y-2">
                  {actionItems.map((item) => {
                    const priorityConfig: Record<string, { bg: string; text: string }> = {
                      Low: { bg: "bg-gray-50", text: "text-gray-700" },
                      Medium: { bg: "bg-blue-50", text: "text-blue-700" },
                      High: { bg: "bg-amber-50", text: "text-amber-700" },
                      Urgent: { bg: "bg-red-50", text: "text-red-700" },
                    };
                    const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
                      Pending: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
                      "In Progress": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
                      Completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
                      Cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
                      Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
                    };
                    const pc = priorityConfig[item.priority] || priorityConfig.Medium;
                    const sc = statusColors[item.status] || statusColors.Pending;
                    return (
                      <div key={item.id} className="flex items-start justify-between rounded-lg border px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm text-[#1a1f36]">{item.title}</p>
                            <Badge className={`${pc.bg} ${pc.text} border-0 text-xs`}>{item.priority}</Badge>
                            <Badge className={`${sc.bg} ${sc.text} border-0 text-xs`}>
                              <span className={`size-1.5 rounded-full ${sc.dot} mr-1`} />
                              {item.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {item.assigned_to_name && <span>Assigned: {item.assigned_to_name}</span>}
                            {item.due_date && <span>Due: {formatInAppTimezone(item.due_date, "MMM dd, yyyy", appTimezone)}</span>}
                          </div>
                        </div>
                        {canEdit && (meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                          <div className="flex items-center gap-1 ml-2">
                            {item.status === "Deleted" || item.status === "Completed" ? (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => handleRestoreActionItem(item.id)}>
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            ) : (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600" onClick={() => handleCompleteActionItem(item.id)}>
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditActionItem(item)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDeleteActionItem(item.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No action items yet.
                </p>
              )}
            </div>

            {/* Action Item Form Modal */}
            {(addActionItemOpen || editActionItem) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">{editActionItem ? "Edit Action Item" : "Add Action Item"}</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title *</label>
                      <input
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={actionItemForm.title}
                        onChange={(e) => setActionItemForm({ ...actionItemForm, title: e.target.value })}
                        placeholder="Action item title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={actionItemForm.description || ""}
                        onChange={(e) => setActionItemForm({ ...actionItemForm, description: e.target.value })}
                        rows={3}
                        placeholder="Detailed description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Assigned To</label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          value={actionItemForm.assigned_to || ""}
                          onChange={(e) => setActionItemForm({ ...actionItemForm, assigned_to: e.target.value })}
                        >
                          <option value="">Unassigned</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          value={actionItemForm.priority}
                          onChange={(e) => setActionItemForm({ ...actionItemForm, priority: e.target.value as CreateMeetingActionItemInput["priority"] })}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Due Date</label>
                      <input
                        type="date"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={actionItemForm.due_date ? new Date(actionItemForm.due_date).toISOString().split("T")[0] : ""}
                        onChange={(e) => setActionItemForm({ ...actionItemForm, due_date: e.target.value ? new Date(e.target.value) : undefined })}
                      />
                    </div>
                    {editActionItem && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          value={editActionItem.status}
                          onChange={(e) => setEditActionItem({ ...editActionItem, status: e.target.value as MeetingActionItem["status"] })}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setAddActionItemOpen(false); setEditActionItem(null); }}>
                      Cancel
                    </Button>
                    <Button onClick={editActionItem ? handleUpdateActionItem : handleAddActionItem} disabled={!actionItemForm.title.trim()}>
                      {editActionItem ? "Save Changes" : "Add Action Item"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#1a1f36]">
                  Attachments
                </h3>
                {canEdit && (meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setAttachmentModalOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Add
                  </Button>
                )}
              </div>
              {meeting.attachments.length > 0 ? (
                <div className="space-y-2">
                  {meeting.attachments.map((url, index) => (
                    <div key={index} className="flex items-center justify-between rounded border px-3 py-2">
                      <div className="flex items-center gap-2 text-sm min-w-0">
                        <Paperclip className="h-4 w-4 text-[#64748b] shrink-0" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3b82f6] hover:underline truncate"
                        >
                          {url.split("/").pop()}
                        </a>
                      </div>
                      {canEdit && (meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-500 shrink-0"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No attachments yet.
                </p>
              )}
            </div>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Action Buttons */}
            {canEdit && (
              <div className="bg-white shadow-sm rounded-xl p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    onClick={() => router.push("/meetings")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  {(meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                    <Button
                      size="sm"
                      className="gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                      onClick={() => setEditModalOpen(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 col-span-2"
                    onClick={() => setStatusModalOpen(true)}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Status
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 col-span-2"
                    onClick={() => setCloneModalOpen(true)}
                    disabled={cloning}
                  >
                    <Copy className="h-4 w-4" />
                    {cloning ? "Cloning..." : "Clone"}
                  </Button>
                </div>
              </div>
            )}

            {/* Meeting Metadata */}
            <div className="bg-white shadow-sm rounded-xl p-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <Badge className={`${sConfig.bg} ${sConfig.text} border-0`}>
                    <span className={`size-1.5 rounded-full ${sConfig.dot} mr-1`} />
                    {meeting.status}
                  </Badge>
                  {canEdit && (meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                    <button
                      className="text-xs text-[#3b82f6] hover:underline"
                      onClick={() => handleStatusUpdate("Completed")}
                    >
                      [Mark as Completed]
                    </button>
                  )}
                </div>
              </div>

              {meeting.meeting_type_name && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Meeting Type
                  </p>
                  <div className="flex items-center gap-2">
                    {meeting.meeting_type_color && (
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: meeting.meeting_type_color }}
                      />
                    )}
                    <p className="text-sm font-medium text-[#1a1f36]">
                      {meeting.meeting_type_name}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Date & Time
                </p>
                <div className="flex items-center gap-2 text-sm text-[#1a1f36]">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatInAppTimezone(meeting.scheduled_date, "MMMM dd, yyyy", appTimezone)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1a1f36] mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {meeting.start_time}
                    {meeting.end_time ? ` - ${meeting.end_time}` : ""}
                  </span>
                </div>
              </div>

              {meeting.location && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Location
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#1a1f36]">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{meeting.location}</span>
                  </div>
                </div>
              )}

              {meeting.meeting_link && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Meeting Link
                  </p>
                  <a
                    href={meeting.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#3b82f6] hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Join Meeting
                  </a>
                </div>
              )}

              {meeting.platform && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Platform
                  </p>
                  <p className="text-sm font-medium text-[#1a1f36]">
                    {meeting.platform}
                  </p>
                </div>
              )}

              {meeting.is_recurring && meeting.recurrence && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Recurrence
                  </p>
                  <p className="text-sm text-[#1a1f36]">
                    Every {meeting.recurrence.interval}{" "}
                    {meeting.recurrence.frequency.toLowerCase()}
                    {meeting.recurrence.end_type === "After" &&
                      ` (${meeting.recurrence.end_after} times)`}
                    {meeting.recurrence.end_type === "On Date" &&
                      ` until ${formatInAppTimezone(
                        meeting.recurrence.end_date!,
                        "MMM dd, yyyy",
                        appTimezone
                      )}`}
                  </p>
                </div>
              )}
            </div>

            {/* Attendees */}
            <div className="bg-white shadow-sm rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Attendees
                </p>
                {canEdit && (meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => setAddAttendeeOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
              {meeting.attendees.length > 0 ? (
                <div className="space-y-2">
                  {meeting.attendees.map((att) => (
                    <div key={att.id} className="flex items-center justify-between rounded border px-3 py-2">
                      <span className="text-sm text-[#1a1f36] truncate">
                        {att.employee_name || "Unknown"}
                      </span>
                      <div className="flex items-center gap-1">
                        {editingAttendeeId === att.id ? (
                          <select
                            className="text-xs border rounded px-1 py-0.5"
                            value={editAttendeeStatus}
                            onChange={(e) => handleUpdateAttendeeStatus(att.id, e.target.value)}
                            onBlur={() => setEditingAttendeeId(null)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Declined">Declined</option>
                            <option value="Tentative">Tentative</option>
                            <option value="Attended">Attended</option>
                            <option value="Absent">Absent</option>
                          </select>
                        ) : (
                          <>
                            <Badge
                              variant="outline"
                              className={
                                att.attendance_status === "Attended"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                                  : att.attendance_status === "Accepted"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                  : att.attendance_status === "Declined"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 text-xs"
                                  : "bg-gray-50 text-gray-700 border-gray-200 text-xs"
                              }
                            >
                              {att.attendance_status}
                            </Badge>
                            {canEdit && (meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0"
                                  onClick={() => {
                                    setEditingAttendeeId(att.id);
                                    setEditAttendeeStatus(att.attendance_status);
                                  }}
                                >
                                  <Pencil className="h-2.5 w-2.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 text-red-500"
                                  onClick={() => handleRemoveAttendee(att.id)}
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No attendees yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <MeetingEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        meeting={meeting}
        meetingTypes={meetingTypes}
        onConfirm={handleEditConfirm}
      />

      <MeetingUpdateStatusModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        currentStatus={meeting.status}
        onConfirm={handleStatusUpdate}
      />

      <MeetingAgendaModal
        open={agendaModalOpen}
        onOpenChange={setAgendaModalOpen}
        meetingId={meeting.id}
        agendaItems={meeting.agenda_items}
        onSaved={async () => {
          const refreshed = await getMeetingById(meeting.id);
          if (refreshed) setMeeting(refreshed);
        }}
      />

      <MeetingCloneModal
        open={cloneModalOpen}
        onOpenChange={setCloneModalOpen}
        meeting={meeting}
        onConfirm={handleCloneConfirm}
        loading={cloning}
      />

      {/* Attachment Upload Modal */}
      {attachmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upload Attachments</h3>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => { setAttachmentModalOpen(false); setPendingFiles([]); }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Files</label>
                <input
                  type="file"
                  multiple
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setPendingFiles((prev) => [...prev, ...files]);
                    e.target.value = "";
                  }}
                />
              </div>
              {pendingFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Selected files:</p>
                  {pendingFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                      <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setAttachmentModalOpen(false); setPendingFiles([]); }}>
                Cancel
              </Button>
              <Button onClick={handleAttachmentUpload} disabled={pendingFiles.length === 0 || uploadingAttachment}>
                {uploadingAttachment ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageGuard>
  );
}
