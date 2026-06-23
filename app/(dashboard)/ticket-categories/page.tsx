"use client";

import { useState, useEffect, useCallback } from "react";
import { TicketCategoryDataTable } from "@/components/data-table/ticket-category-data-table";
import { createTicketCategoryColumns } from "@/components/data-table/ticket-category-data-table-columns";
import { TicketCategoryFormModal } from "@/components/modals/ticket-category-form-modal";
import { TicketCategoryViewModal } from "@/components/modals/ticket-category-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getTicketCategories, createTicketCategory, updateTicketCategory, deleteTicketCategory, restoreTicketCategory } from "@/lib/actions/ticket-category-actions";
import type { TicketCategory, CreateTicketCategoryInput, TicketCategoryFilters } from "@/lib/types/ticket-category";
import { toast } from "sonner";

export default function TicketCategoriesPage() {
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [viewTicketCategory, setViewTicketCategory] = useState<TicketCategory | null>(null);
  const [editTicketCategory, setEditTicketCategory] = useState<TicketCategory | null>(null);
  const [deleteTicketCategoryItem, setDeleteTicketCategoryItem] = useState<TicketCategory | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<TicketCategoryFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getTicketCategories();
        if (!cancelled) setTicketCategories(data);
      } catch {
        if (!cancelled) toast.error("Failed to load ticket categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleServerSearch = useCallback((filters: TicketCategoryFilters) => {
    setActiveFilters(filters);
    getTicketCategories(filters).then((data) => setTicketCategories(data)).catch(() => {
      toast.error("Failed to search ticket categories");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getTicketCategories().then((data) => setTicketCategories(data)).catch(() => {
      toast.error("Failed to load ticket categories");
    });
  }, []);

  const handleView = (ticketCategory: TicketCategory) => {
    setViewTicketCategory(ticketCategory);
  };

  const handleEdit = (ticketCategory: TicketCategory) => {
    setEditTicketCategory(ticketCategory);
    setFormOpen(true);
  };

  const handleDelete = (ticketCategory: TicketCategory) => {
    setDeleteTicketCategoryItem(ticketCategory);
  };

  const handleRestore = async (ticketCategory: TicketCategory) => {
    try {
      await restoreTicketCategory(ticketCategory.id);
      toast.success(`${ticketCategory.name} has been restored`);
      const data = await getTicketCategories(activeFilters);
      setTicketCategories(data);
    } catch {
      toast.error("Failed to restore ticket category");
    }
  };

  const handleAdd = () => {
    setEditTicketCategory(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateTicketCategoryInput) => {
    try {
      if (editTicketCategory) {
        await updateTicketCategory(editTicketCategory.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createTicketCategory(data);
        toast.success(`${data.name} has been added`);
      }
      const refreshed = await getTicketCategories(activeFilters);
      setTicketCategories(refreshed);
    } catch {
      toast.error("Failed to save ticket category");
      throw new Error("Failed to save ticket category");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteTicketCategoryItem) {
      try {
        await deleteTicketCategory(deleteTicketCategoryItem.id, reason || undefined);
        toast.success(`${deleteTicketCategoryItem.name} has been deleted`);
        setDeleteTicketCategoryItem(null);
        const refreshed = await getTicketCategories(activeFilters);
        setTicketCategories(refreshed);
      } catch {
        toast.error("Failed to delete ticket category");
      }
    }
  };

  const columns = createTicketCategoryColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Ticket Categories</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage ticket categories
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading ticket categories...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/ticket-categories">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Ticket Categories</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage ticket categories
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <TicketCategoryDataTable
            columns={columns}
            data={ticketCategories}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <TicketCategoryFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          ticketCategory={editTicketCategory}
          onSubmit={handleFormSubmit}
        />

        <TicketCategoryViewModal
          open={!!viewTicketCategory}
          onOpenChange={(open) => !open && setViewTicketCategory(null)}
          ticketCategory={viewTicketCategory}
        />

        <DeleteConfirmModal
          open={!!deleteTicketCategoryItem}
          onOpenChange={(open) => !open && setDeleteTicketCategoryItem(null)}
          assetName={deleteTicketCategoryItem?.name || ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
