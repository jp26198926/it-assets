"use client";

import { useState, useEffect, useCallback } from "react";
import { RoleDataTable } from "@/components/data-table/role-data-table";
import { createRoleColumns } from "@/components/data-table/role-data-table-columns";
import { RoleFormModal } from "@/components/modals/role-form-modal";
import { RoleViewModal } from "@/components/modals/role-view-modal";
import { RolePermissionModal } from "@/components/modals/role-permission-modal";
import { RoleDuplicateModal } from "@/components/modals/role-duplicate-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getRoles, createRole, updateRole, deleteRole, restoreRole, duplicateRole } from "@/lib/actions/role-actions";
import type { Role, CreateRoleInput, RoleFilters } from "@/lib/types/role";
import { toast } from "sonner";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRoleItem, setDeleteRoleItem] = useState<Role | null>(null);
  const [permissionRole, setPermissionRole] = useState<Role | null>(null);
  const [duplicateRoleItem, setDuplicateRoleItem] = useState<Role | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<RoleFilters>({});

  const loadData = useCallback(async (filters?: RoleFilters) => {
    try {
      const data = await getRoles(filters);
      setRoles(data);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleServerSearch = useCallback((filters: RoleFilters) => {
    setActiveFilters(filters);
    getRoles(filters).then((data) => setRoles(data)).catch(() => {
      toast.error("Failed to search roles");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getRoles().then((data) => setRoles(data)).catch(() => {
      toast.error("Failed to load roles");
    });
  }, []);

  const handleView = (role: Role) => {
    setViewRole(role);
  };

  const handleEdit = (role: Role) => {
    setEditRole(role);
    setFormOpen(true);
  };

  const handleDelete = (role: Role) => {
    setDeleteRoleItem(role);
  };

  const handlePermission = (role: Role) => {
    setPermissionRole(role);
  };

  const handleDuplicate = (role: Role) => {
    setDuplicateRoleItem(role);
  };

  const handleDuplicateSubmit = async (data: CreateRoleInput) => {
    if (!duplicateRoleItem) return;
    try {
      await duplicateRole(duplicateRoleItem.id, {
        name: data.name,
        description: data.description,
      });
      toast.success(`${data.name} has been created`);
      setDuplicateRoleItem(null);
      loadData(activeFilters);
    } catch {
      toast.error("Failed to duplicate role");
      throw new Error("Failed to duplicate role");
    }
  };

  const handleRestore = async (role: Role) => {
    try {
      await restoreRole(role.id);
      toast.success(`${role.name} has been restored`);
      loadData(activeFilters);
    } catch {
      toast.error("Failed to restore role");
    }
  };

  const handleAdd = () => {
    setEditRole(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateRoleInput) => {
    try {
      if (editRole) {
        await updateRole(editRole.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createRole(data);
        toast.success(`${data.name} has been added`);
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save role");
      throw new Error("Failed to save role");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteRoleItem) {
      try {
        await deleteRole(deleteRoleItem.id, reason || undefined);
        toast.success(`${deleteRoleItem.name} has been deleted`);
        setDeleteRoleItem(null);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to delete role");
      }
    }
  };

  const columns = createRoleColumns(handleView, handleEdit, handleDelete, handleRestore, handlePermission, handleDuplicate);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Roles</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and organize application roles
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/roles">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Roles</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and organize application roles
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <RoleDataTable
            columns={columns}
            data={roles}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onDuplicate={handleDuplicate}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <RoleFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          role={editRole}
          onSubmit={handleFormSubmit}
        />

        <RoleViewModal
          open={!!viewRole}
          onOpenChange={(open) => !open && setViewRole(null)}
          role={viewRole}
        />

        <DeleteConfirmModal
          open={!!deleteRoleItem}
          onOpenChange={(open) => !open && setDeleteRoleItem(null)}
          assetName={deleteRoleItem?.name || ""}
          onConfirm={handleDeleteConfirm}
        />

        <RolePermissionModal
          open={!!permissionRole}
          onOpenChange={(open) => !open && setPermissionRole(null)}
          role={permissionRole}
        />

        <RoleDuplicateModal
          open={!!duplicateRoleItem}
          onOpenChange={(open) => !open && setDuplicateRoleItem(null)}
          role={duplicateRoleItem}
          onSubmit={handleDuplicateSubmit}
        />
      </div>
    </PageGuard>
  );
}
