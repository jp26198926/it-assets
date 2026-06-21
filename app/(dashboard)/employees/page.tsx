"use client";

import { useState, useEffect, useCallback } from "react";
import { EmployeeDataTable } from "@/components/data-table/employee-data-table";
import { createEmployeeColumns } from "@/components/data-table/employee-data-table-columns";
import { EmployeeFormModal } from "@/components/modals/employee-form-modal";
import { EmployeeViewModal } from "@/components/modals/employee-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, restoreEmployee } from "@/lib/actions/employee-actions";
import type { Employee, CreateEmployeeInput, EmployeeFilters } from "@/lib/types/employee";
import { toast } from "sonner";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteEmployeeItem, setDeleteEmployeeItem] = useState<Employee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<EmployeeFilters>({});

  const loadData = useCallback(async (filters?: EmployeeFilters) => {
    try {
      const data = await getEmployees(filters);
      setEmployees(data);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleServerSearch = useCallback((filters: EmployeeFilters) => {
    setActiveFilters(filters);
    getEmployees(filters).then((data) => setEmployees(data)).catch(() => {
      toast.error("Failed to search employees");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getEmployees().then((data) => setEmployees(data)).catch(() => {
      toast.error("Failed to load employees");
    });
  }, []);

  const handleView = (employee: Employee) => {
    setViewEmployee(employee);
  };

  const handleEdit = (employee: Employee) => {
    setEditEmployee(employee);
    setFormOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setDeleteEmployeeItem(employee);
  };

  const handleRestore = async (employee: Employee) => {
    try {
      await restoreEmployee(employee.id);
      toast.success(`${employee.firstname} ${employee.lastname} has been restored`);
      loadData(activeFilters);
    } catch {
      toast.error("Failed to restore employee");
    }
  };

  const handleAdd = () => {
    setEditEmployee(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateEmployeeInput) => {
    try {
      if (editEmployee) {
        await updateEmployee(editEmployee.id, data);
        toast.success(`${data.firstname} ${data.lastname} has been updated`);
      } else {
        await createEmployee(data);
        toast.success(`${data.firstname} ${data.lastname} has been added`);
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save employee");
      throw new Error("Failed to save employee");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteEmployeeItem) {
      try {
        await deleteEmployee(deleteEmployeeItem.id);
        toast.success(`${deleteEmployeeItem.firstname} ${deleteEmployeeItem.lastname} has been deleted`);
        setDeleteEmployeeItem(null);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to delete employee");
      }
    }
  };

  const columns = createEmployeeColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Employees</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and organize company employees
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/employees">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Employees</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and organize company employees
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <EmployeeDataTable
            columns={columns}
            data={employees}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <EmployeeFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          employee={editEmployee}
          onSubmit={handleFormSubmit}
        />

        <EmployeeViewModal
          open={!!viewEmployee}
          onOpenChange={(open) => !open && setViewEmployee(null)}
          employee={viewEmployee}
        />

        <DeleteConfirmModal
          open={!!deleteEmployeeItem}
          onOpenChange={(open) => !open && setDeleteEmployeeItem(null)}
          assetName={deleteEmployeeItem ? `${deleteEmployeeItem.firstname} ${deleteEmployeeItem.lastname}` : ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
