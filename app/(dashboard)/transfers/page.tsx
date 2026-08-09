"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TransferDataTable } from "@/components/data-table/transfer-data-table";
import { createTransferColumns } from "@/components/data-table/transfer-data-table-columns";
import { TransferFormModal } from "@/components/modals/transfer-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  getTransfers,
  createTransfer,
  updateTransfer,
  cancelTransfer,
} from "@/lib/actions/transfer-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import type {
  Transfer,
  CreateTransferInput,
  TransferFilters,
} from "@/lib/types/transfer";
import { toast } from "sonner";

export default function TransfersPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [editTransfer, setEditTransfer] = useState<Transfer | null>(null);
  const [cancelTransferItem, setCancelTransferItem] =
    useState<Transfer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appTimezone, setAppTimezone] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<TransferFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [data, settings] = await Promise.all([
          getTransfers({ status: "Active" }),
          getAppSettings(),
        ]);
        if (!cancelled) {
          setTransfers(data);
          setAppTimezone(settings.timezone);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load transfers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleServerSearch = useCallback((filters: TransferFilters) => {
    setActiveFilters(filters);
    getTransfers(filters)
      .then((data) => setTransfers(data))
      .catch(() => {
        toast.error("Failed to search transfers");
      });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getTransfers({ status: "Active" })
      .then((data) => setTransfers(data))
      .catch(() => {
        toast.error("Failed to load transfers");
      });
  }, []);

  const handleView = (transfer: Transfer) => {
    router.push(`/transfers/${transfer.id}`);
  };

  const handleEdit = (transfer: Transfer) => {
    setEditTransfer(transfer);
    setFormOpen(true);
  };

  const handleCancel = (transfer: Transfer) => {
    setCancelTransferItem(transfer);
  };

  const handleAdd = () => {
    setEditTransfer(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateTransferInput) => {
    try {
      if (editTransfer) {
        await updateTransfer(editTransfer.id, data);
        toast.success(`Transfer ${editTransfer.code} has been updated`);
      } else {
        await createTransfer(data);
        toast.success("Transfer has been created");
      }
      const refreshed = await getTransfers(activeFilters);
      setTransfers(refreshed);
    } catch {
      toast.error("Failed to save transfer");
      throw new Error("Failed to save transfer");
    }
  };

  const handleCancelConfirm = async (reason: string) => {
    if (cancelTransferItem) {
      try {
        await cancelTransfer(cancelTransferItem.id);
        toast.success(
          `Transfer ${cancelTransferItem.code} has been cancelled`,
        );
        setCancelTransferItem(null);
        const refreshed = await getTransfers(activeFilters);
        setTransfers(refreshed);
      } catch {
        toast.error("Failed to cancel transfer");
      }
    }
  };

  const columns = createTransferColumns(
    handleView,
    handleEdit,
    handleCancel,
    appTimezone,
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Transfers
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage transfer records
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading transfers...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/transfers">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Transfers
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage transfer records
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <TransferDataTable
            columns={columns}
            data={transfers}
            onView={handleView}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <TransferFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          transfer={editTransfer}
          onSubmit={handleFormSubmit}
        />

        <DeleteConfirmModal
          open={!!cancelTransferItem}
          onOpenChange={(open) => !open && setCancelTransferItem(null)}
          assetName={cancelTransferItem?.code || ""}
          onConfirm={handleCancelConfirm}
          title="Cancel Transfer"
        />
      </div>
    </PageGuard>
  );
}
