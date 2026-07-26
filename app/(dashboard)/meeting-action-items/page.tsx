"use client";

import { useState, useEffect, useCallback } from "react";
import { MeetingActionItemDataTable } from "@/components/data-table/meeting-action-item-data-table";
import { createMeetingActionItemColumns } from "@/components/data-table/meeting-action-item-data-table-columns";
import { MeetingActionItemFormModal } from "@/components/modals/meeting-action-item-form-modal";
import { MeetingActionItemViewModal } from "@/components/modals/meeting-action-item-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getAppSettings } from "@/lib/actions/application-actions";
import {
  getMeetingActionItems,
  createMeetingActionItem,
  updateMeetingActionItem,
  deleteMeetingActionItem,
  restoreMeetingActionItem,
} from "@/lib/actions/meeting-action-item-actions";
import { getMeetings } from "@/lib/actions/meeting-actions";
import { getEmployeeList } from "@/lib/actions/employee-actions";
import type {
  MeetingActionItem,
  CreateMeetingActionItemInput,
  UpdateMeetingActionItemInput,
  MeetingActionItemFilters,
} from "@/lib/types/meeting-action-item";
import { toast } from "sonner";

const statuses = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const priorities = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
];

export default function MeetingActionItemsPage() {
  const [items, setItems] = useState<MeetingActionItem[]>([]);
  const [viewItem, setViewItem] = useState<MeetingActionItem | null>(null);
  const [editItem, setEditItem] = useState<MeetingActionItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MeetingActionItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appTimezone, setAppTimezone] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<MeetingActionItemFilters>(
    {}
  );
  const [meetings, setMeetings] = useState<
    { id: string; title: string; meeting_no: number }[]
  >([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    []
  );

  const loadData = useCallback(async (filters?: MeetingActionItemFilters) => {
    try {
      setLoading(true);
      const data = await getMeetingActionItems(filters);
      setItems(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load action items"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    getMeetings()
      .then((mts) =>
        setMeetings(
          mts.map((m) => ({
            id: m.id,
            title: m.title,
            meeting_no: m.meeting_no,
          }))
        )
      )
      .catch(() => {});
    getEmployeeList().then(setEmployees).catch(() => {});
  getAppSettings().then(s => setAppTimezone(s.timezone)).catch(() => {});
  }, [loadData]);

  function handleView(item: MeetingActionItem) {
    setViewItem(item);
  }

  function handleEdit(item: MeetingActionItem) {
    setEditItem(item);
    setFormOpen(true);
  }

  function handleDelete(item: MeetingActionItem) {
    setDeleteItem(item);
  }

  async function handleRestore(item: MeetingActionItem) {
    try {
      await restoreMeetingActionItem(item.id);
      toast.success("Action item restored");
      loadData(activeFilters);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to restore"
      );
    }
  }

  function handleAdd() {
    setEditItem(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(
    data: CreateMeetingActionItemInput | UpdateMeetingActionItemInput
  ) {
    if (editItem) {
      await updateMeetingActionItem(
        editItem.id,
        data as UpdateMeetingActionItemInput
      );
      toast.success("Action item updated");
    } else {
      await createMeetingActionItem(data as CreateMeetingActionItemInput);
      toast.success("Action item created");
    }
    loadData(activeFilters);
  }

  async function handleDeleteConfirm(reason: string) {
    if (deleteItem) {
      await deleteMeetingActionItem(deleteItem.id, reason || undefined);
      toast.success("Action item deleted");
      setDeleteItem(null);
      loadData(activeFilters);
    }
  }

  function handleServerSearch(filters: MeetingActionItemFilters) {
    setActiveFilters(filters);
    loadData(filters);
  }

  function handleServerSearchClear() {
    setActiveFilters({});
    loadData();
  }

  const columns = createMeetingActionItemColumns(
    handleView,
    handleEdit,
    handleDelete,
    handleRestore
  );

  return (
    <PageGuard pagePath="/meeting-action-items">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Meeting Action Items
            </h1>
            <p className="text-muted-foreground">
              Track and manage follow-up tasks from meetings.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading action items...
            </div>
          ) : (
            <MeetingActionItemDataTable
              columns={columns}
              data={items}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onAdd={handleAdd}
              onServerSearch={handleServerSearch}
              onServerSearchClear={handleServerSearchClear}
              statuses={statuses}
              timezone={appTimezone}
              priorities={priorities}
            />
          )}
        </ScrollReveal>

        <MeetingActionItemFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          item={editItem}
          onSubmit={handleFormSubmit}
          meetings={meetings}
          employees={employees}
        />

        <MeetingActionItemViewModal
          open={!!viewItem}
          onOpenChange={(open) =>
          !open && setViewItem(null)}
          item={viewItem}
        />

        <DeleteConfirmModal
          open={!!deleteItem}
          onOpenChange={(open) => !open && setDeleteItem(null)}
          assetName={deleteItem?.title || ""}
          onConfirm={handleDeleteConfirm}
          title="Delete Action Item"
        />
      </div>
    </PageGuard>
  );
}
