"use client";

import { useState, useEffect, useCallback } from "react";
import { AdjustmentDataTable } from "@/components/data-table/adjustment-data-table";
import { createAdjustmentColumns } from "@/components/data-table/adjustment-data-table-columns";
import { AdjustmentFormModal } from "@/components/modals/adjustment-form-modal";
import { AdjustmentViewModal } from "@/components/modals/adjustment-view-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  getAdjustments,
  createAdjustment,
} from "@/lib/actions/adjustment-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import type {
  Adjustment,
  CreateAdjustmentInput,
  AdjustmentFilters,
} from "@/lib/types/adjustment";
import { toast } from "sonner";

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [viewItem, setViewItem] = useState<Adjustment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appTimezone, setAppTimezone] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<AdjustmentFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [data, settings] = await Promise.all([
          getAdjustments(),
          getAppSettings(),
        ]);
        if (!cancelled) {
          setAdjustments(data);
          setAppTimezone(settings.timezone);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load adjustments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleServerSearch = useCallback((filters: AdjustmentFilters) => {
    setActiveFilters(filters);
    getAdjustments(filters)
      .then((data) => setAdjustments(data))
      .catch(() => {
        toast.error("Failed to search adjustments");
      });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getAdjustments()
      .then((data) => setAdjustments(data))
      .catch(() => {
        toast.error("Failed to load adjustments");
      });
  }, []);

  const handleView = (adjustment: Adjustment) => {
    setViewItem(adjustment);
  };

  const handleAdd = () => {
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateAdjustmentInput) => {
    try {
      await createAdjustment(data);
      toast.success("Adjustment has been created");
      const refreshed = await getAdjustments(activeFilters);
      setAdjustments(refreshed);
    } catch {
      toast.error("Failed to save adjustment");
      throw new Error("Failed to save adjustment");
    }
  };

  const columns = createAdjustmentColumns(
    handleView,
    appTimezone,
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Adjustments
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage stock adjustments
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading adjustments...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/adjustments">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Adjustments
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage stock adjustments
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <AdjustmentDataTable
            columns={columns}
            data={adjustments}
            onView={handleView}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <AdjustmentFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
        />

        <AdjustmentViewModal
          open={!!viewItem}
          onOpenChange={(open) => !open && setViewItem(null)}
          adjustment={viewItem}
        />
      </div>
    </PageGuard>
  );
}
