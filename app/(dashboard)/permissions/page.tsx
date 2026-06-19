"use client";

import { useState, useEffect, useCallback } from "react";
import { PermissionDataTable } from "@/components/data-table/permission-data-table";
import { createPermissionColumns } from "@/components/data-table/permission-data-table-columns";
import { PermissionFormModal } from "@/components/modals/permission-form-modal";
import { PermissionViewModal } from "@/components/modals/permission-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getPermissions, createPermission, updatePermission, deletePermission, restorePermission } from "@/lib/actions/permission-actions";
import type { Permission, CreatePermissionInput, PermissionFilters } from "@/lib/types/permission";
import { toast } from "sonner";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [viewPermission, setViewPermission] = useState<Permission | null>(null);
  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [deletePermissionItem, setDeletePermissionItem] = useState<Permission | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<PermissionFilters>({});

  const loadData = useCallback(async (filters?: PermissionFilters) => {
    try {
      const data = await getPermissions(filters);
      setPermissions(data);
    } catch {
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleServerSearch = useCallback((filters: PermissionFilters) => {
    setActiveFilters(filters);
    getPermissions(filters).then((data) => setPermissions(data)).catch(() => {
      toast.error("Failed to search permissions");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getPermissions().then((data) => setPermissions(data)).catch(() => {
      toast.error("Failed to load permissions");
    });
  }, []);

  const handleView = (permission: Permission) => {
    setViewPermission(permission);
  };

  const handleEdit = (permission: Permission) => {
    setEditPermission(permission);
    setFormOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setDeletePermissionItem(permission);
  };

  const handleRestore = async (permission: Permission) => {
    try {
      await restorePermission(permission.id);
      toast.success(`${permission.name} has been restored`);
      loadData(activeFilters);
    } catch {
      toast.error("Failed to restore permission");
    }
  };

  const handleAdd = () => {
    setEditPermission(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreatePermissionInput) => {
    try {
      if (editPermission) {
        await updatePermission(editPermission.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createPermission(data);
        toast.success(`${data.name} has been added`);
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save permission");
      throw new Error("Failed to save permission");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletePermissionItem) {
      try {
        await deletePermission(deletePermissionItem.id);
        toast.success(`${deletePermissionItem.name} has been deleted`);
        setDeletePermissionItem(null);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to delete permission");
      }
    }
  };

  const columns = createPermissionColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Permissions</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and organize application permissions
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ScrollReveal>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Permissions</h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1">
            Manage and organize application permissions
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <PermissionDataTable
          columns={columns}
          data={permissions}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onAdd={handleAdd}
          onServerSearch={handleServerSearch}
          onServerSearchClear={handleServerSearchClear}
        />
      </ScrollReveal>

      <PermissionFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        permission={editPermission}
        onSubmit={handleFormSubmit}
      />

      <PermissionViewModal
        open={!!viewPermission}
        onOpenChange={(open) => !open && setViewPermission(null)}
        permission={viewPermission}
      />

      <DeleteConfirmModal
        open={!!deletePermissionItem}
        onOpenChange={(open) => !open && setDeletePermissionItem(null)}
        assetName={deletePermissionItem?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
