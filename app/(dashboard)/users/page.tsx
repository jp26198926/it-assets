"use client";

import { useState, useEffect, useCallback } from "react";
import { UserDataTable } from "@/components/data-table/user-data-table";
import { createUserColumns } from "@/components/data-table/user-data-table-columns";
import { UserFormModal } from "@/components/modals/user-form-modal";
import { UserViewModal } from "@/components/modals/user-view-modal";
import { UserChangePasswordModal } from "@/components/modals/user-change-password-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getUsers, createUser, updateUser, deleteUser, restoreUser, changePassword } from "@/lib/actions/user-actions";
import type { User, CreateUserInput, UserFilters } from "@/lib/types/user";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserItem, setDeleteUserItem] = useState<User | null>(null);
  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<UserFilters>({});

  const loadData = useCallback(async (filters?: UserFilters) => {
    try {
      const data = await getUsers(filters);
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleServerSearch = useCallback((filters: UserFilters) => {
    setActiveFilters(filters);
    getUsers(filters).then((data) => setUsers(data)).catch(() => {
      toast.error("Failed to search users");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getUsers().then((data) => setUsers(data)).catch(() => {
      toast.error("Failed to load users");
    });
  }, []);

  const handleView = (user: User) => {
    setViewUser(user);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setFormOpen(true);
  };

  const handleDelete = (user: User) => {
    setDeleteUserItem(user);
  };

  const handleChangePassword = (user: User) => {
    setChangePasswordUser(user);
  };

  const handleChangePasswordSubmit = async (password: string) => {
    if (!changePasswordUser) return;
    try {
      await changePassword(changePasswordUser.id, password);
      toast.success(`Password updated for ${changePasswordUser.first_name} ${changePasswordUser.last_name}`);
      setChangePasswordUser(null);
    } catch {
      toast.error("Failed to change password");
      throw new Error("Failed to change password");
    }
  };

  const handleRestore = async (user: User) => {
    try {
      await restoreUser(user.id);
      toast.success(`${user.first_name} ${user.last_name} has been restored`);
      loadData(activeFilters);
    } catch {
      toast.error("Failed to restore user");
    }
  };

  const handleAdd = () => {
    setEditUser(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateUserInput) => {
    try {
      if (editUser) {
        await updateUser(editUser.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          department_id: data.department_id,
          role_id: data.role_id,
        });
        toast.success(`${data.first_name} ${data.last_name} has been updated`);
      } else {
        await createUser(data);
        toast.success(`${data.first_name} ${data.last_name} has been added`);
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save user");
      throw new Error("Failed to save user");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteUserItem) {
      try {
        await deleteUser(deleteUserItem.id, reason || undefined);
        toast.success(`${deleteUserItem.first_name} ${deleteUserItem.last_name} has been deleted`);
        setDeleteUserItem(null);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to delete user");
      }
    }
  };

  const columns = createUserColumns(handleView, handleEdit, handleDelete, handleRestore, handleChangePassword);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Users</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage system users and their access
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/users">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Users</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage system users and their access
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <UserDataTable
            columns={columns}
            data={users}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onChangePassword={handleChangePassword}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <UserFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          user={editUser}
          onSubmit={handleFormSubmit}
        />

        <UserViewModal
          open={!!viewUser}
          onOpenChange={(open) => !open && setViewUser(null)}
          user={viewUser}
        />

        <UserChangePasswordModal
          open={!!changePasswordUser}
          onOpenChange={(open) => !open && setChangePasswordUser(null)}
          userName={changePasswordUser ? `${changePasswordUser.first_name} ${changePasswordUser.last_name}` : ""}
          onSubmit={handleChangePasswordSubmit}
        />

        <DeleteConfirmModal
          open={!!deleteUserItem}
          onOpenChange={(open) => !open && setDeleteUserItem(null)}
          assetName={deleteUserItem ? `${deleteUserItem.first_name} ${deleteUserItem.last_name}` : ""}
          title="Delete User"
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
