"use client";

import { useState, useEffect, useCallback } from "react";
import { DepartmentDataTable } from "@/components/data-table/department-data-table";
import { createDepartmentColumns } from "@/components/data-table/department-data-table-columns";
import { DepartmentFormModal } from "@/components/modals/department-form-modal";
import { DepartmentViewModal } from "@/components/modals/department-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, restoreDepartment } from "@/lib/actions/department-actions";
import type { Department, CreateDepartmentInput, DepartmentFilters } from "@/lib/types/department";
import { toast } from "sonner";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [viewDepartment, setViewDepartment] = useState<Department | null>(null);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [deleteDepartmentItem, setDeleteDepartmentItem] = useState<Department | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<DepartmentFilters>({});

  const loadData = useCallback(async (filters?: DepartmentFilters) => {
    try {
      const data = await getDepartments(filters);
      setDepartments(data);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleServerSearch = useCallback((filters: DepartmentFilters) => {
    setActiveFilters(filters);
    getDepartments(filters).then((data) => setDepartments(data)).catch(() => {
      toast.error("Failed to search departments");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getDepartments().then((data) => setDepartments(data)).catch(() => {
      toast.error("Failed to load departments");
    });
  }, []);

  const handleView = (department: Department) => {
    setViewDepartment(department);
  };

  const handleEdit = (department: Department) => {
    setEditDepartment(department);
    setFormOpen(true);
  };

  const handleDelete = (department: Department) => {
    setDeleteDepartmentItem(department);
  };

  const handleRestore = async (department: Department) => {
    try {
      await restoreDepartment(department.id);
      toast.success(`${department.name} has been restored`);
      loadData(activeFilters);
    } catch {
      toast.error("Failed to restore department");
    }
  };

  const handleAdd = () => {
    setEditDepartment(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateDepartmentInput) => {
    try {
      if (editDepartment) {
        await updateDepartment(editDepartment.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createDepartment(data);
        toast.success(`${data.name} has been added`);
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save department");
      throw new Error("Failed to save department");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteDepartmentItem) {
      try {
        await deleteDepartment(deleteDepartmentItem.id);
        toast.success(`${deleteDepartmentItem.name} has been deleted`);
        setDeleteDepartmentItem(null);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to delete department");
      }
    }
  };

  const columns = createDepartmentColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Departments</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and organize company departments
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ScrollReveal>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Departments</h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1">
            Manage and organize company departments
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <DepartmentDataTable
          columns={columns}
          data={departments}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onAdd={handleAdd}
          onServerSearch={handleServerSearch}
          onServerSearchClear={handleServerSearchClear}
        />
      </ScrollReveal>

      <DepartmentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editDepartment}
        onSubmit={handleFormSubmit}
      />

      <DepartmentViewModal
        open={!!viewDepartment}
        onOpenChange={(open) => !open && setViewDepartment(null)}
        department={viewDepartment}
      />

      <DeleteConfirmModal
        open={!!deleteDepartmentItem}
        onOpenChange={(open) => !open && setDeleteDepartmentItem(null)}
        assetName={deleteDepartmentItem?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
