"use client";

import { useState, useEffect, useCallback } from "react";
import { AssignmentDataTable } from "@/components/data-table/assignment-data-table";
import { createAssignmentColumns } from "@/components/data-table/assignment-data-table-columns";
import { AssignmentFormModal } from "@/components/modals/assignment-form-modal";
import { AssignmentViewModal } from "@/components/modals/assignment-view-modal";
import { AssignmentReturnModal } from "@/components/modals/assignment-return-modal";
import { AssignmentMarkLostModal } from "@/components/modals/assignment-mark-lost-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  returnAssignment,
  markAsLost,
  restoreAssignment,
} from "@/lib/actions/assignment-actions";
import type {
  Assignment,
  CreateAssignmentInput,
  ReturnAssignmentInput,
  MarkAsLostInput,
  AssignmentFilters,
} from "@/lib/types/assignment";
import { toast } from "sonner";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [returnAssignmentItem, setReturnAssignmentItem] =
    useState<Assignment | null>(null);
  const [returnFormOpen, setReturnFormOpen] = useState(false);
  const [markLostItem, setMarkLostItem] = useState<Assignment | null>(null);
  const [markLostFormOpen, setMarkLostFormOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<AssignmentFilters>({});

  const loadData = useCallback(async (filters?: AssignmentFilters) => {
    try {
      const data = await getAssignments(filters);
      setAssignments(data);
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleServerSearch = useCallback((filters: AssignmentFilters) => {
    setActiveFilters(filters);
    getAssignments(filters)
      .then((data) => setAssignments(data))
      .catch(() => {
        toast.error("Failed to search assignments");
      });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getAssignments()
      .then((data) => setAssignments(data))
      .catch(() => {
        toast.error("Failed to load assignments");
      });
  }, []);

  const handleView = (assignment: Assignment) => {
    setViewAssignment(assignment);
  };

  const handleEdit = (assignment: Assignment) => {
    setEditAssignment(assignment);
    setFormOpen(true);
  };

  const handleReturn = (assignment: Assignment) => {
    setReturnAssignmentItem(assignment);
    setReturnFormOpen(true);
  };

  const handleMarkAsLost = (assignment: Assignment) => {
    setMarkLostItem(assignment);
    setMarkLostFormOpen(true);
  };

  const handleRestore = async (assignment: Assignment) => {
    try {
      await restoreAssignment(assignment.id);
      toast.success("Assignment has been restored");
      loadData(activeFilters);
    } catch {
      toast.error("Failed to restore assignment");
    }
  };

  const handleAdd = () => {
    setEditAssignment(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateAssignmentInput) => {
    try {
      if (editAssignment) {
        await updateAssignment(editAssignment.id, data);
        toast.success("Assignment has been updated");
      } else {
        await createAssignment(data);
        toast.success("Assignment has been added");
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save assignment");
      throw new Error("Failed to save assignment");
    }
  };

  const handleReturnSubmit = async (data: ReturnAssignmentInput) => {
    if (returnAssignmentItem) {
      try {
        await returnAssignment(returnAssignmentItem.id, data);
        toast.success("Assignment has been returned");
        setReturnAssignmentItem(null);
        setReturnFormOpen(false);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to return assignment");
        throw new Error("Failed to return assignment");
      }
    }
  };

  const handleMarkAsLostSubmit = async (data: MarkAsLostInput) => {
    if (markLostItem) {
      try {
        await markAsLost(markLostItem.id, data);
        toast.success("Assignment has been marked as lost");
        setMarkLostItem(null);
        setMarkLostFormOpen(false);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to mark as lost");
        throw new Error("Failed to mark as lost");
      }
    }
  };

  const columns = createAssignmentColumns(
    handleView,
    handleEdit,
    handleReturn,
    handleMarkAsLost,
    handleRestore,
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Assignments
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Track and manage asset assignments to employees and departments
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/assignments">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Assignments
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Track and manage asset assignments to employees and departments
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <AssignmentDataTable
            columns={columns}
            data={assignments}
            onView={handleView}
            onEdit={handleEdit}
            onReturn={handleReturn}
            onMarkAsLost={handleMarkAsLost}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <AssignmentFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          assignment={editAssignment}
          onSubmit={handleFormSubmit}
        />

        <AssignmentViewModal
          open={!!viewAssignment}
          onOpenChange={(open) => !open && setViewAssignment(null)}
          assignment={viewAssignment}
        />

        <AssignmentReturnModal
          open={returnFormOpen}
          onOpenChange={setReturnFormOpen}
          assignment={returnAssignmentItem}
          onSubmit={handleReturnSubmit}
        />

        <AssignmentMarkLostModal
          open={markLostFormOpen}
          onOpenChange={setMarkLostFormOpen}
          assignment={markLostItem}
          onSubmit={handleMarkAsLostSubmit}
        />
      </div>
    </PageGuard>
  );
}
