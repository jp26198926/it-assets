"use client";

import { useState, useEffect, useCallback } from "react";
import { StockMovementDataTable } from "@/components/data-table/stock-movement-data-table";
import { createStockMovementColumns } from "@/components/data-table/stock-movement-data-table-columns";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getStockMovements } from "@/lib/actions/stock-movement-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import type { StockMovement, StockMovementFilters } from "@/lib/types/stock-movement";
import { toast } from "sonner";

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [appTimezone, setAppTimezone] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [data, settings] = await Promise.all([
          getStockMovements(),
          getAppSettings(),
        ]);
        if (!cancelled) {
          setMovements(data);
          setAppTimezone(settings.timezone);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load stock movements");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleServerSearch = useCallback((filters: StockMovementFilters) => {
    getStockMovements(filters)
      .then((data) => setMovements(data))
      .catch(() => {
        toast.error("Failed to search stock movements");
      });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    getStockMovements()
      .then((data) => setMovements(data))
      .catch(() => {
        toast.error("Failed to load stock movements");
      });
  }, []);

  const columns = createStockMovementColumns(appTimezone);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Stock Movements</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              View inventory transaction history
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading stock movements...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/stock-movements">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Stock Movements</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              View inventory transaction history
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <StockMovementDataTable
            columns={columns}
            data={movements}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>
      </div>
    </PageGuard>
  );
}
