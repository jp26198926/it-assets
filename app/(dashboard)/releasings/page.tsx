"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ReleasingDataTable } from "@/components/data-table/releasing-data-table";
import { createReleasingColumns } from "@/components/data-table/releasing-data-table-columns";
import { ReleasingFormModal } from "@/components/modals/releasing-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  getReleasings,
  createReleasing,
  updateReleasing,
  cancelReleasing,
} from "@/lib/actions/releasing-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import type { Releasing, CreateReleasingInput, ReleasingFilters } from "@/lib/types/releasing";
import { toast } from "sonner";

export default function ReleasingsPage() {
  const router = useRouter();
  const [releasings, setReleasings] = useState<Releasing[]>([]);
  const [editReleasing, setEditReleasing] = useState<Releasing | null>(null);
  const [cancelReleasingItem, setCancelReleasingItem] = useState<Releasing | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appTimezone, setAppTimezone] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<ReleasingFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [data, settings] = await Promise.all([
          getReleasings({ status: "Active" }),
          getAppSettings(),
        ]);
        if (!cancelled) {
          setReleasings(data);
          setAppTimezone(settings.timezone);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load releasings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleServerSearch = useCallback((filters: ReleasingFilters) => {
    setActiveFilters(filters);
    getReleasings(filters).then((data) => setReleasings(data)).catch(() => {
      toast.error("Failed to search releasings");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getReleasings({ status: "Active" }).then((data) => setReleasings(data)).catch(() => {
      toast.error("Failed to load releasings");
    });
  }, []);

  const handleView = (releasing: Releasing) => {
    router.push(`/releasings/${releasing.id}`);
  };

  const handleEdit = (releasing: Releasing) => {
    setEditReleasing(releasing);
    setFormOpen(true);
  };

  const handleCancel = (releasing: Releasing) => {
    setCancelReleasingItem(releasing);
  };

  const handleAdd = () => {
    setEditReleasing(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateReleasingInput) => {
    try {
      if (editReleasing) {
        await updateReleasing(editReleasing.id, data);
        toast.success(`Releasing ${editReleasing.code} has been updated`);
      } else {
        await createReleasing(data);
        toast.success("Releasing has been created");
      }
      const refreshed = await getReleasings(activeFilters);
      setReleasings(refreshed);
    } catch {
      toast.error("Failed to save releasing");
      throw new Error("Failed to save releasing");
    }
  };

  const handleCancelConfirm = async (reason: string) => {
    if (cancelReleasingItem) {
      try {
        await cancelReleasing(cancelReleasingItem.id);
        toast.success(`Releasing ${cancelReleasingItem.code} has been cancelled`);
        setCancelReleasingItem(null);
        const refreshed = await getReleasings(activeFilters);
        setReleasings(refreshed);
      } catch {
        toast.error("Failed to cancel releasing");
      }
    }
  };

  const columns = createReleasingColumns(handleView, handleEdit, handleCancel, appTimezone);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Releasings</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">Manage releasing records</p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading releasings...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/releasings">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Releasings</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">Manage releasing records</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <ReleasingDataTable
            columns={columns}
            data={releasings}
            onView={handleView}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <ReleasingFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          releasing={editReleasing}
          onSubmit={handleFormSubmit}
        />

        <DeleteConfirmModal
          open={!!cancelReleasingItem}
          onOpenChange={(open) => !open && setCancelReleasingItem(null)}
          assetName={cancelReleasingItem?.code || ""}
          onConfirm={handleCancelConfirm}
          title="Cancel Releasing"
        />
      </div>
    </PageGuard>
  );
}
