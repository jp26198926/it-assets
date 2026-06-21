"use client";

import { useState, useEffect, useCallback } from "react";
import { ItemDataTable } from "@/components/data-table/item-data-table";
import { createItemColumns } from "@/components/data-table/item-data-table-columns";
import { ItemFormModal } from "@/components/modals/item-form-modal";
import { ItemViewModal } from "@/components/modals/item-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getItems, createItem, updateItem, deleteItem, restoreItem } from "@/lib/actions/item-actions";
import type { Item, CreateItemInput, ItemFilters } from "@/lib/types/item";
import { toast } from "sonner";

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteItemItem, setDeleteItemItem] = useState<Item | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<ItemFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getItems();
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) toast.error("Failed to load items");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleServerSearch = useCallback((filters: ItemFilters) => {
    setActiveFilters(filters);
    getItems(filters).then((data) => setItems(data)).catch(() => {
      toast.error("Failed to search items");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getItems().then((data) => setItems(data)).catch(() => {
      toast.error("Failed to load items");
    });
  }, []);

  const handleView = (item: Item) => {
    setViewItem(item);
  };

  const handleEdit = (item: Item) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item: Item) => {
    setDeleteItemItem(item);
  };

  const handleRestore = async (item: Item) => {
    try {
      await restoreItem(item.id);
      toast.success(`${item.name} has been restored`);
      const data = await getItems(activeFilters);
      setItems(data);
    } catch {
      toast.error("Failed to restore item");
    }
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateItemInput) => {
    try {
      if (editItem) {
        await updateItem(editItem.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createItem(data);
        toast.success(`${data.name} has been added`);
      }
      const refreshed = await getItems(activeFilters);
      setItems(refreshed);
    } catch {
      toast.error("Failed to save item");
      throw new Error("Failed to save item");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteItemItem) {
      try {
        await deleteItem(deleteItemItem.id);
        toast.success(`${deleteItemItem.name} has been deleted`);
        setDeleteItemItem(null);
        const refreshed = await getItems(activeFilters);
        setItems(refreshed);
      } catch {
        toast.error("Failed to delete item");
      }
    }
  };

  const columns = createItemColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Items</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage inventory items
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/items">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Items</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage inventory items
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <ItemDataTable
            columns={columns}
            data={items}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <ItemFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          item={editItem}
          onSubmit={handleFormSubmit}
        />

        <ItemViewModal
          open={!!viewItem}
          onOpenChange={(open) => !open && setViewItem(null)}
          item={viewItem}
        />

        <DeleteConfirmModal
          open={!!deleteItemItem}
          onOpenChange={(open) => !open && setDeleteItemItem(null)}
          assetName={deleteItemItem?.name || ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
