"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MeetingDataTable } from "@/components/data-table/meeting-data-table";
import { createMeetingColumns } from "@/components/data-table/meeting-data-table-columns";
import { MeetingFormModal } from "@/components/modals/meeting-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  restoreMeeting,
  getMeetingTypeSelectOptions,
} from "@/lib/actions/meeting-actions";
import { getEmployeeList } from "@/lib/actions/employee-actions";
import type {
  Meeting,
  CreateMeetingInput,
  MeetingFilters,
  MeetingTypeSelectOption,
} from "@/lib/types/meeting";
import { toast } from "sonner";

const statuses = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
  const [deleteItem, setDeleteItem] = useState<Meeting | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<MeetingFilters>({});
  const [meetingTypes, setMeetingTypes] = useState<MeetingTypeSelectOption[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  const loadData = useCallback(async (filters?: MeetingFilters) => {
    try {
      setLoading(true);
      const data = await getMeetings(filters);
      setMeetings(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load meetings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    getMeetingTypeSelectOptions().then(setMeetingTypes).catch(() => {});
    getEmployeeList().then(setEmployees).catch(() => {});
  }, [loadData]);

  function handleView(meeting: Meeting) {
    router.push(`/meetings/${meeting.id}`);
  }

  function handleEdit(meeting: Meeting) {
    setEditMeeting(meeting);
    setFormOpen(true);
  }

  function handleDelete(meeting: Meeting) {
    setDeleteItem(meeting);
  }

  async function handleRestore(meeting: Meeting) {
    try {
      await restoreMeeting(meeting.id);
      toast.success("Meeting restored");
      loadData(activeFilters);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to restore"
      );
    }
  }

  function handleAdd() {
    setEditMeeting(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: CreateMeetingInput) {
    if (editMeeting) {
      await updateMeeting(editMeeting.id, data);
      toast.success("Meeting updated");
      loadData(activeFilters);
    } else {
      const created = await createMeeting(data);
      toast.success("Meeting created");
      router.push(`/meetings/${created.id}`);
    }
  }

  async function handleDeleteConfirm(reason: string) {
    if (deleteItem) {
      await deleteMeeting(deleteItem.id, reason || undefined);
      toast.success("Meeting deleted");
      setDeleteItem(null);
      loadData(activeFilters);
    }
  }

  function handleServerSearch(filters: MeetingFilters) {
    setActiveFilters(filters);
    loadData(filters);
  }

  function handleServerSearchClear() {
    setActiveFilters({});
    loadData();
  }

  const columns = createMeetingColumns(handleView, handleEdit, handleDelete, handleRestore);

  return (
    <PageGuard pagePath="/meetings">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground">
              Schedule, manage, and record minutes of meetings.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading meetings...
            </div>
          ) : (
            <MeetingDataTable
              columns={columns}
              data={meetings}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onAdd={handleAdd}
              onServerSearch={handleServerSearch}
              onServerSearchClear={handleServerSearchClear}
              meetingTypes={meetingTypes}
              statuses={statuses}
            />
          )}
        </ScrollReveal>

        <MeetingFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          meeting={editMeeting}
          onSubmit={handleFormSubmit}
          meetingTypes={meetingTypes}
          employees={employees}
        />

        <DeleteConfirmModal
          open={!!deleteItem}
          onOpenChange={(open) => !open && setDeleteItem(null)}
          assetName={deleteItem?.title || ""}
          onConfirm={handleDeleteConfirm}
          title="Delete Meeting"
        />
      </div>
    </PageGuard>
  );
}
