"use client";

import { useState, useEffect, useCallback } from "react";
import { UOMDataTable } from "@/components/data-table/uom-data-table";
import { createUOMColumns } from "@/components/data-table/uom-data-table-columns";
import { UOMFormModal } from "@/components/modals/uom-form-modal";
import { UOMViewModal } from "@/components/modals/uom-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getUOMs, createUOM, updateUOM, deleteUOM, restoreUOM } from "@/lib/actions/uom-actions";
import type { UOM, CreateUOMInput, UOMFilters } from "@/lib/types/uom";
import { toast } from "sonner";

export default function UOMsPage() {
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [viewUOM, setViewUOM] = useState<UOM | null>(null);
  const [editUOM, setEditUOM] = useState<UOM | null>(null);
  const [deleteUOMItem, setDeleteUOMItem] = useState<UOM | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<UOMFilters>({});

  const loadData = useCallback(async (filters?: UOMFilters) => {
    try {
      const data = await getUOMs(filters);
      setUOMs(data);
    } catch {
      toast.error("Failed to load UOMs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleServerSearch = useCallback((filters: UOMFilters) => {
    setActiveFilters(filters);
    getUOMs(filters).then((data) => setUOMs(data)).catch(() => {
      toast.error("Failed to search UOMs");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getUOMs().then((data) => setUOMs(data)).catch(() => {
      toast.error("Failed to load UOMs");
    });
  }, []);

  const handleView = (uom: UOM) => {
    setViewUOM(uom);
  };

  const handleEdit = (uom: UOM) => {
    setEditUOM(uom);
    setFormOpen(true);
  };

  const handleDelete = (uom: UOM) => {
    setDeleteUOMItem(uom);
  };

  const handleRestore = async (uom: UOM) => {
    try {
      await restoreUOM(uom.id);
      toast.success(`${uom.name} has been restored`);
      loadData(activeFilters);
    } catch {
      toast.error("Failed to restore UOM");
    }
  };

  const handleAdd = () => {
    setEditUOM(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateUOMInput) => {
    try {
      if (editUOM) {
        await updateUOM(editUOM.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createUOM(data);
        toast.success(`${data.name} has been added`);
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save UOM");
      throw new Error("Failed to save UOM");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteUOMItem) {
      try {
        await deleteUOM(deleteUOMItem.id, reason || undefined);
        toast.success(`${deleteUOMItem.name} has been deleted`);
        setDeleteUOMItem(null);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to delete UOM");
      }
    }
  };

  const columns = createUOMColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">UOMs</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage units of measure
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading UOMs...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/uoms">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">UOMs</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage units of measure
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <UOMDataTable
            columns={columns}
            data={uoms}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <UOMFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          uom={editUOM}
          onSubmit={handleFormSubmit}
        />

        <UOMViewModal
          open={!!viewUOM}
          onOpenChange={(open) => !open && setViewUOM(null)}
          uom={viewUOM}
        />

        <DeleteConfirmModal
          open={!!deleteUOMItem}
          onOpenChange={(open) => !open && setDeleteUOMItem(null)}
          assetName={deleteUOMItem?.name || ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
