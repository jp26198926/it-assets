"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createColumns } from "@/components/data-table/data-table-columns";
import { AssetFormModal } from "@/components/modals/asset-form-modal";
import { AssetViewModal } from "@/components/modals/asset-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { mockAssets } from "@/lib/mock-data";
import type { ITAsset } from "@/lib/types";
import { toast } from "sonner";

export default function AssetsPage() {
  const [assets, setAssets] = useState<ITAsset[]>(mockAssets);
  const [viewAsset, setViewAsset] = useState<ITAsset | null>(null);
  const [editAsset, setEditAsset] = useState<ITAsset | null>(null);
  const [deleteAsset, setDeleteAsset] = useState<ITAsset | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleView = (asset: ITAsset) => {
    setViewAsset(asset);
  };

  const handleEdit = (asset: ITAsset) => {
    setEditAsset(asset);
    setFormOpen(true);
  };

  const handleDelete = (asset: ITAsset) => {
    setDeleteAsset(asset);
  };

  const handleRestore = (asset: ITAsset) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === asset.id ? { ...a, isDeleted: false } : a
      )
    );
    toast.success(`${asset.name} has been restored`);
  };

  const handleAdd = () => {
    setEditAsset(null);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<ITAsset, "id" | "isDeleted">) => {
    if (editAsset) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === editAsset.id ? { ...a, ...data } : a
        )
      );
      toast.success(`${data.name} has been updated`);
    } else {
      const newAsset: ITAsset = {
        ...data,
        id: String(Date.now()),
        isDeleted: false,
      };
      setAssets((prev) => [newAsset, ...prev]);
      toast.success(`${data.name} has been added`);
    }
    setFormOpen(false);
    setEditAsset(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteAsset) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === deleteAsset.id ? { ...a, isDeleted: true } : a
        )
      );
      toast.success(`${deleteAsset.name} has been deleted`);
      setDeleteAsset(null);
    }
  };

  const columns = createColumns(handleView, handleEdit, handleDelete, handleRestore);

  return (
    <div className="space-y-4 sm:space-y-6">
      <ScrollReveal>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">IT Assets</h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1">
            Manage and track all IT hardware and software assets
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <DataTable
          columns={columns}
          data={assets}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onAdd={handleAdd}
        />
      </ScrollReveal>

      <AssetFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        asset={editAsset}
        onSubmit={handleFormSubmit}
      />

      <AssetViewModal
        open={!!viewAsset}
        onOpenChange={(open) => !open && setViewAsset(null)}
        asset={viewAsset}
      />

      <DeleteConfirmModal
        open={!!deleteAsset}
        onOpenChange={(open) => !open && setDeleteAsset(null)}
        assetName={deleteAsset?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
