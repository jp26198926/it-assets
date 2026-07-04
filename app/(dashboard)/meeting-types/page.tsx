"use client";

import { useState, useEffect, useCallback } from "react";
import { MeetingTypeDataTable } from "@/components/data-table/meeting-type-data-table";
import { createMeetingTypeColumns } from "@/components/data-table/meeting-type-data-table-columns";
import { MeetingTypeFormModal } from "@/components/modals/meeting-type-form-modal";
import { MeetingTypeViewModal } from "@/components/modals/meeting-type-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  getMeetingTypes,
  createMeetingType,
  updateMeetingType,
  deleteMeetingType,
  restoreMeetingType,
} from "@/lib/actions/meeting-type-actions";
import type {
  MeetingType,
  CreateMeetingTypeInput,
  MeetingTypeFilters,
} from "@/lib/types/meeting-type";
import { toast } from "sonner";

export default function MeetingTypesPage() {
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [viewMeetingType, setViewMeetingType] = useState<MeetingType | null>(null);
  const [editMeetingType, setEditMeetingType] = useState<MeetingType | null>(null);
  const [deleteItem, setDeleteItem] = useState<MeetingType | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<MeetingTypeFilters>({});

  const loadData = useCallback(async (filters?: MeetingTypeFilters) => {
    try {
      setLoading(true);
      const data = await getMeetingTypes(filters);
      setMeetingTypes(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load meeting types"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleView(meetingType: MeetingType) {
    setViewMeetingType(meetingType);
  }

  function handleEdit(meetingType: MeetingType) {
    setEditMeetingType(meetingType);
    setFormOpen(true);
  }

  function handleDelete(meetingType: MeetingType) {
    setDeleteItem(meetingType);
  }

  async function handleRestore(meetingType: MeetingType) {
    try {
      await restoreMeetingType(meetingType.id);
      toast.success("Meeting type restored");
      loadData(activeFilters);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to restore"
      );
    }
  }

  function handleAdd() {
    setEditMeetingType(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: CreateMeetingTypeInput) {
    if (editMeetingType) {
      await updateMeetingType(editMeetingType.id, data);
      toast.success("Meeting type updated");
    } else {
      await createMeetingType(data);
      toast.success("Meeting type created");
    }
    loadData(activeFilters);
  }

  async function handleDeleteConfirm(reason: string) {
    if (deleteItem) {
      await deleteMeetingType(deleteItem.id, reason || undefined);
      toast.success("Meeting type deleted");
      setDeleteItem(null);
      loadData(activeFilters);
    }
  }

  function handleServerSearch(filters: { search?: string }) {
    setActiveFilters(filters);
    loadData(filters);
  }

  function handleServerSearchClear() {
    setActiveFilters({});
    loadData();
  }

  const columns = createMeetingTypeColumns(handleView, handleEdit, handleDelete, handleRestore);

  return (
    <PageGuard pagePath="/meeting-types">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Meeting Types
            </h1>
            <p className="text-muted-foreground">
              Manage meeting type categories for your organization.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading meeting types...
            </div>
          ) : (
            <MeetingTypeDataTable
              columns={columns}
              data={meetingTypes}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onAdd={handleAdd}
              onServerSearch={handleServerSearch}
              onServerSearchClear={handleServerSearchClear}
            />
          )}
        </ScrollReveal>

        <MeetingTypeFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          meetingType={editMeetingType}
          onSubmit={handleFormSubmit}
        />

        <MeetingTypeViewModal
          open={!!viewMeetingType}
          onOpenChange={(open) => !open && setViewMeetingType(null)}
          meetingType={viewMeetingType}
        />

        <DeleteConfirmModal
          open={!!deleteItem}
          onOpenChange={(open) => !open && setDeleteItem(null)}
          assetName={deleteItem?.name || ""}
          onConfirm={handleDeleteConfirm}
          title="Delete Meeting Type"
        />
      </div>
    </PageGuard>
  );
}
