"use client";

import { useState, useEffect, useCallback } from "react";
import { CategoryDataTable } from "@/components/data-table/category-data-table";
import { createCategoryColumns } from "@/components/data-table/category-data-table-columns";
import { CategoryFormModal } from "@/components/modals/category-form-modal";
import { CategoryViewModal } from "@/components/modals/category-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getCategories, createCategory, updateCategory, deleteCategory, restoreCategory } from "@/lib/actions/category-actions";
import type { Category, CreateCategoryInput, CategoryFilters } from "@/lib/types/category";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategoryItem, setDeleteCategoryItem] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<CategoryFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getCategories();
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) toast.error("Failed to load categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleServerSearch = useCallback((filters: CategoryFilters) => {
    setActiveFilters(filters);
    getCategories(filters).then((data) => setCategories(data)).catch(() => {
      toast.error("Failed to search categories");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getCategories().then((data) => setCategories(data)).catch(() => {
      toast.error("Failed to load categories");
    });
  }, []);

  const handleView = (category: Category) => {
    setViewCategory(category);
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeleteCategoryItem(category);
  };

  const handleRestore = async (category: Category) => {
    try {
      await restoreCategory(category.id);
      toast.success(`${category.name} has been restored`);
      const data = await getCategories(activeFilters);
      setCategories(data);
    } catch {
      toast.error("Failed to restore category");
    }
  };

  const handleAdd = () => {
    setEditCategory(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateCategoryInput) => {
    try {
      if (editCategory) {
        await updateCategory(editCategory.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createCategory(data);
        toast.success(`${data.name} has been added`);
      }
      const refreshed = await getCategories(activeFilters);
      setCategories(refreshed);
    } catch {
      toast.error("Failed to save category");
      throw new Error("Failed to save category");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteCategoryItem) {
      try {
        await deleteCategory(deleteCategoryItem.id);
        toast.success(`${deleteCategoryItem.name} has been deleted`);
        setDeleteCategoryItem(null);
        const refreshed = await getCategories(activeFilters);
        setCategories(refreshed);
      } catch {
        toast.error("Failed to delete category");
      }
    }
  };

  const columns = createCategoryColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Categories</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage asset categories
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/categories">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Categories</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage asset categories
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <CategoryDataTable
            columns={columns}
            data={categories}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <CategoryFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          category={editCategory}
          onSubmit={handleFormSubmit}
        />

        <CategoryViewModal
          open={!!viewCategory}
          onOpenChange={(open) => !open && setViewCategory(null)}
          category={viewCategory}
        />

        <DeleteConfirmModal
          open={!!deleteCategoryItem}
          onOpenChange={(open) => !open && setDeleteCategoryItem(null)}
          assetName={deleteCategoryItem?.name || ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
