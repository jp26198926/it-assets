"use client";

import { useState, useEffect, useCallback } from "react";
import { SupplierDataTable } from "@/components/data-table/supplier-data-table";
import { createSupplierColumns } from "@/components/data-table/supplier-data-table-columns";
import { SupplierFormModal } from "@/components/modals/supplier-form-modal";
import { SupplierViewModal } from "@/components/modals/supplier-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, restoreSupplier } from "@/lib/actions/supplier-actions";
import type { Supplier, CreateSupplierInput, SupplierFilters } from "@/lib/types/supplier";
import { toast } from "sonner";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteSupplierItem, setDeleteSupplierItem] = useState<Supplier | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<SupplierFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getSuppliers();
        if (!cancelled) setSuppliers(data);
      } catch {
        if (!cancelled) toast.error("Failed to load suppliers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleServerSearch = useCallback((filters: SupplierFilters) => {
    setActiveFilters(filters);
    getSuppliers(filters).then((data) => setSuppliers(data)).catch(() => {
      toast.error("Failed to search suppliers");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getSuppliers().then((data) => setSuppliers(data)).catch(() => {
      toast.error("Failed to load suppliers");
    });
  }, []);

  const handleView = (supplier: Supplier) => {
    setViewSupplier(supplier);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setFormOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setDeleteSupplierItem(supplier);
  };

  const handleRestore = async (supplier: Supplier) => {
    try {
      await restoreSupplier(supplier.id);
      toast.success(`${supplier.name} has been restored`);
      const data = await getSuppliers(activeFilters);
      setSuppliers(data);
    } catch {
      toast.error("Failed to restore supplier");
    }
  };

  const handleAdd = () => {
    setEditSupplier(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateSupplierInput) => {
    try {
      if (editSupplier) {
        await updateSupplier(editSupplier.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createSupplier(data);
        toast.success(`${data.name} has been added`);
      }
      const refreshed = await getSuppliers(activeFilters);
      setSuppliers(refreshed);
    } catch {
      toast.error("Failed to save supplier");
      throw new Error("Failed to save supplier");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteSupplierItem) {
      try {
        await deleteSupplier(deleteSupplierItem.id, reason || undefined);
        toast.success(`${deleteSupplierItem.name} has been deleted`);
        setDeleteSupplierItem(null);
        const refreshed = await getSuppliers(activeFilters);
        setSuppliers(refreshed);
      } catch {
        toast.error("Failed to delete supplier");
      }
    }
  };

  const columns = createSupplierColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Suppliers</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage suppliers
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/suppliers">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Suppliers</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage suppliers
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <SupplierDataTable
            columns={columns}
            data={suppliers}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <SupplierFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          supplier={editSupplier}
          onSubmit={handleFormSubmit}
        />

        <SupplierViewModal
          open={!!viewSupplier}
          onOpenChange={(open) =>
          !open && setViewSupplier(null)}
          supplier={viewSupplier}
        />

        <DeleteConfirmModal
          open={!!deleteSupplierItem}
          onOpenChange={(open) => !open && setDeleteSupplierItem(null)}
          assetName={deleteSupplierItem?.name || ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
