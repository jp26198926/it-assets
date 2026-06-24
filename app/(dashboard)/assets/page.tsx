"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AssetDataTable } from "@/components/data-table/asset-data-table";
import { createAssetColumns } from "@/components/data-table/asset-data-table-columns";
import { AssetFormModal } from "@/components/modals/asset-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  restoreAsset,
} from "@/lib/actions/asset-actions";
import type { Asset, CreateAssetInput, AssetFilters } from "@/lib/types/asset";
import { toast } from "sonner";

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [deleteAssetItem, setDeleteAssetItem] = useState<Asset | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<AssetFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getAssets();
        if (!cancelled) setAssets(data);
      } catch {
        if (!cancelled) toast.error("Failed to load assets");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleServerSearch = useCallback((filters: AssetFilters) => {
    setActiveFilters(filters);
    getAssets(filters)
      .then((data) => setAssets(data))
      .catch(() => {
        toast.error("Failed to search assets");
      });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getAssets()
      .then((data) => setAssets(data))
      .catch(() => {
        toast.error("Failed to load assets");
      });
  }, []);

  const handleView = (asset: Asset) => {
    router.push(`/assets/${asset.id}`);
  };

  const handleEdit = (asset: Asset) => {
    setEditAsset(asset);
    setFormOpen(true);
  };

  const handleDelete = (asset: Asset) => {
    setDeleteAssetItem(asset);
  };

  const handleRestore = async (asset: Asset) => {
    try {
      await restoreAsset(asset.id);
      toast.success(`${asset.barcode} has been restored`);
      const data = await getAssets(activeFilters);
      setAssets(data);
    } catch {
      toast.error("Failed to restore asset");
    }
  };

  const handleAdd = () => {
    setEditAsset(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateAssetInput) => {
    try {
      if (editAsset) {
        await updateAsset(editAsset.id, data);
        toast.success(`${data.barcode} has been updated`);
      } else {
        await createAsset(data);
        toast.success(`${data.barcode} has been added`);
      }
      const refreshed = await getAssets(activeFilters);
      setAssets(refreshed);
    } catch {
      toast.error("Failed to save asset");
      throw new Error("Failed to save asset");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteAssetItem) {
      try {
        await deleteAsset(deleteAssetItem.id, reason || undefined);
        toast.success(`${deleteAssetItem.barcode} has been deleted`);
        setDeleteAssetItem(null);
        const refreshed = await getAssets(activeFilters);
        setAssets(refreshed);
      } catch {
        toast.error("Failed to delete asset");
      }
    }
  };

  const columns = createAssetColumns(
    handleView,
    handleEdit,
    handleDelete,
    handleRestore,
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Assets
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and track all IT assets
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/assets">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Assets
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and track all IT assets
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <AssetDataTable
            columns={columns}
            data={assets}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <AssetFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          asset={editAsset}
          onSubmit={handleFormSubmit}
        />

        <DeleteConfirmModal
          open={!!deleteAssetItem}
          onOpenChange={(open) => !open && setDeleteAssetItem(null)}
          assetName={deleteAssetItem?.barcode || ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
