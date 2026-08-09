"use client";

import { useState, useEffect, useCallback } from "react";
import { StockLevelDataTable } from "@/components/data-table/stock-level-data-table";
import { createStockLevelColumns } from "@/components/data-table/stock-level-data-table-columns";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getStockLevels } from "@/lib/actions/stock-level-actions";
import type { StockLevel, StockLevelFilters } from "@/lib/types/stock-level";
import { toast } from "sonner";

export default function StockLevelsPage() {
  const [levels, setLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getStockLevels();
        if (!cancelled) setLevels(data);
      } catch {
        if (!cancelled) toast.error("Failed to load stock levels");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleServerSearch = useCallback((filters: StockLevelFilters) => {
    const loadFiltered = async () => {
      try {
        const data = await getStockLevels();
        let filtered = data;

        if (filters.item_name) {
          filtered = filtered.filter((item) =>
            item.item_name?.toLowerCase().includes(filters.item_name!.toLowerCase())
          );
        }
        if (filters.item_code) {
          filtered = filtered.filter((item) =>
            item.item_code?.toLowerCase().includes(filters.item_code!.toLowerCase())
          );
        }
        if (filters.location_name) {
          filtered = filtered.filter((item) =>
            item.location_name?.toLowerCase().includes(filters.location_name!.toLowerCase())
          );
        }
        if (filters.qty_min !== undefined) {
          filtered = filtered.filter((item) => item.qty >= filters.qty_min!);
        }
        if (filters.qty_max !== undefined) {
          filtered = filtered.filter((item) => item.qty <= filters.qty_max!);
        }

        setLevels(filtered);
      } catch {
        toast.error("Failed to search stock levels");
      }
    };
    loadFiltered();
  }, []);

  const handleServerSearchClear = useCallback(async () => {
    try {
      const data = await getStockLevels();
      setLevels(data);
    } catch {
      toast.error("Failed to load stock levels");
    }
  }, []);

  const columns = createStockLevelColumns();

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Stock Levels</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              View current inventory levels by item and location
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading stock levels...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/stock-levels">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Stock Levels</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              View current inventory levels by item and location
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <StockLevelDataTable
            columns={columns}
            data={levels}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>
      </div>
    </PageGuard>
  );
}
