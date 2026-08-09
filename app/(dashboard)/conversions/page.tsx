"use client";

import { useState, useEffect, useCallback } from "react";
import { ConversionDataTable } from "@/components/data-table/conversion-data-table";
import { createConversionColumns } from "@/components/data-table/conversion-data-table-columns";
import { ConversionFormModal } from "@/components/modals/conversion-form-modal";
import { ConversionViewModal } from "@/components/modals/conversion-view-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  getConversions,
  createConversion,
} from "@/lib/actions/conversion-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import type {
  Conversion,
  CreateConversionInput,
  ConversionFilters,
} from "@/lib/types/conversion";
import { toast } from "sonner";

export default function ConversionsPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [viewItem, setViewItem] = useState<Conversion | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appTimezone, setAppTimezone] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<ConversionFilters>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [data, settings] = await Promise.all([
          getConversions(),
          getAppSettings(),
        ]);
        if (!cancelled) {
          setConversions(data);
          setAppTimezone(settings.timezone);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load conversions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleServerSearch = useCallback((filters: ConversionFilters) => {
    setActiveFilters(filters);
    getConversions(filters)
      .then((data) => setConversions(data))
      .catch(() => {
        toast.error("Failed to search conversions");
      });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getConversions()
      .then((data) => setConversions(data))
      .catch(() => {
        toast.error("Failed to load conversions");
      });
  }, []);

  const handleView = (conversion: Conversion) => {
    setViewItem(conversion);
  };

  const handleAdd = () => {
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateConversionInput) => {
    try {
      await createConversion(data);
      toast.success("Conversion has been created");
      const refreshed = await getConversions(activeFilters);
      setConversions(refreshed);
    } catch {
      toast.error("Failed to save conversion");
      throw new Error("Failed to save conversion");
    }
  };

  const columns = createConversionColumns(
    handleView,
    appTimezone,
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Conversions
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage stock conversions between items
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading conversions...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/conversions">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Conversions
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage stock conversions between items
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <ConversionDataTable
            columns={columns}
            data={conversions}
            onView={handleView}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <ConversionFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
        />

        <ConversionViewModal
          open={!!viewItem}
          onOpenChange={(open) => !open && setViewItem(null)}
          conversion={viewItem}
        />
      </div>
    </PageGuard>
  );
}
