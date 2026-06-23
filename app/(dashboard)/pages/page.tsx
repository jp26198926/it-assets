"use client";

import { useState, useEffect, useCallback } from "react";
import { PageDataTable } from "@/components/data-table/page-data-table";
import { createPageColumns } from "@/components/data-table/page-data-table-columns";
import { PageFormModal } from "@/components/modals/page-form-modal";
import { PageViewModal } from "@/components/modals/page-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getPages, createPage, updatePage, deletePage, restorePage } from "@/lib/actions/page-actions";
import type { Page, CreatePageInput, PageFilters } from "@/lib/types/page";
import { toast } from "sonner";

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [viewPage, setViewPage] = useState<Page | null>(null);
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [deletePageItem, setDeletePageItem] = useState<Page | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<PageFilters>({});

  const loadData = useCallback(async (filters?: PageFilters) => {
    try {
      const pagesData = await getPages(filters);
      setPages(pagesData);
    } catch {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleServerSearch = useCallback((filters: PageFilters) => {
    setActiveFilters(filters);
    getPages(filters).then((data) => setPages(data)).catch(() => {
      toast.error("Failed to search pages");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getPages().then((data) => setPages(data)).catch(() => {
      toast.error("Failed to load pages");
    });
  }, []);

  const handleView = (page: Page) => {
    setViewPage(page);
  };

  const handleEdit = (page: Page) => {
    setEditPage(page);
    setFormOpen(true);
  };

  const handleDelete = (page: Page) => {
    setDeletePageItem(page);
  };

  const handleRestore = async (page: Page) => {
    try {
      await restorePage(page.id);
      toast.success(`${page.name} has been restored`);
      loadData(activeFilters);
    } catch {
      toast.error("Failed to restore page");
    }
  };

  const handleAdd = () => {
    setEditPage(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreatePageInput) => {
    try {
      if (editPage) {
        await updatePage(editPage.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createPage(data);
        toast.success(`${data.name} has been added`);
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save page");
      throw new Error("Failed to save page");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deletePageItem) {
      try {
        await deletePage(deletePageItem.id, reason || undefined);
        toast.success(`${deletePageItem.name} has been deleted`);
        setDeletePageItem(null);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to delete page");
      }
    }
  };

  const columns = createPageColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Pages</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and organize application pages and navigation
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/pages">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Pages</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and organize application pages and navigation
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <PageDataTable
            columns={columns}
            data={pages}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <PageFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          page={editPage}
          pages={pages}
          onSubmit={handleFormSubmit}
        />

        <PageViewModal
          open={!!viewPage}
          onOpenChange={(open) => !open && setViewPage(null)}
          page={viewPage}
        />

        <DeleteConfirmModal
          open={!!deletePageItem}
          onOpenChange={(open) => !open && setDeletePageItem(null)}
          assetName={deletePageItem?.name || ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
