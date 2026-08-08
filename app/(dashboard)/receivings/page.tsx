"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ReceivingDataTable } from "@/components/data-table/receiving-data-table";
import { createReceivingColumns } from "@/components/data-table/receiving-data-table-columns";
import { ReceivingFormModal } from "@/components/modals/receiving-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  getReceivings,
  createReceiving,
  updateReceiving,
  cancelReceiving,
} from "@/lib/actions/receiving-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import type {
  Receiving,
  CreateReceivingInput,
  ReceivingFilters,
} from "@/lib/types/receiving";
import { toast } from "sonner";

export default function ReceivingsPage() {
  const router = useRouter();
  const [receivings, setReceivings] = useState<Receiving[]>([]);
  const [editReceiving, setEditReceiving] = useState<Receiving | null>(null);
  const [cancelReceivingItem, setCancelReceivingItem] =
    useState<Receiving | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appTimezone, setAppTimezone] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<ReceivingFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [data, settings] = await Promise.all([
          getReceivings({ status: "Active" }),
          getAppSettings(),
        ]);
        if (!cancelled) {
          setReceivings(data);
          setAppTimezone(settings.timezone);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load receivings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleServerSearch = useCallback((filters: ReceivingFilters) => {
    setActiveFilters(filters);
    getReceivings(filters)
      .then((data) => setReceivings(data))
      .catch(() => {
        toast.error("Failed to search receivings");
      });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getReceivings({ status: "Active" })
      .then((data) => setReceivings(data))
      .catch(() => {
        toast.error("Failed to load receivings");
      });
  }, []);

  const handleView = (receiving: Receiving) => {
    router.push(`/receivings/${receiving.id}`);
  };

  const handleEdit = (receiving: Receiving) => {
    setEditReceiving(receiving);
    setFormOpen(true);
  };

  const handleCancel = (receiving: Receiving) => {
    setCancelReceivingItem(receiving);
  };

  const handleAdd = () => {
    setEditReceiving(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateReceivingInput) => {
    try {
      if (editReceiving) {
        await updateReceiving(editReceiving.id, data);
        toast.success(`Receiving ${editReceiving.code} has been updated`);
      } else {
        await createReceiving(data);
        toast.success("Receiving has been created");
      }
      const refreshed = await getReceivings(activeFilters);
      setReceivings(refreshed);
    } catch {
      toast.error("Failed to save receiving");
      throw new Error("Failed to save receiving");
    }
  };

  const handleCancelConfirm = async (reason: string) => {
    if (cancelReceivingItem) {
      try {
        await cancelReceiving(cancelReceivingItem.id);
        toast.success(
          `Receiving ${cancelReceivingItem.code} has been cancelled`,
        );
        setCancelReceivingItem(null);
        const refreshed = await getReceivings(activeFilters);
        setReceivings(refreshed);
      } catch {
        toast.error("Failed to cancel receiving");
      }
    }
  };

  const columns = createReceivingColumns(
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
              Receivings
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage receiving records
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading receivings...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/receivings">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Receivings
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage receiving records
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <ReceivingDataTable
            columns={columns}
            data={receivings}
            onView={handleView}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <ReceivingFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          receiving={editReceiving}
          onSubmit={handleFormSubmit}
        />

        <DeleteConfirmModal
          open={!!cancelReceivingItem}
          onOpenChange={(open) => !open && setCancelReceivingItem(null)}
          assetName={cancelReceivingItem?.code || ""}
          onConfirm={handleCancelConfirm}
          title="Cancel Receiving"
        />
      </div>
    </PageGuard>
  );
}
