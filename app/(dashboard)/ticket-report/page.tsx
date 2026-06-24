"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { DateRangeFilter } from "@/components/reports/date-range-filter";
import { TicketListTab } from "@/components/reports/ticket-list-tab";
import { TicketSummaryTab } from "@/components/reports/ticket-summary-tab";
import { TicketTotalsTab } from "@/components/reports/ticket-totals-tab";
import { TicketCategoryTab } from "@/components/reports/ticket-category-tab";
import { BarChart3, List, PieChart, Tag } from "lucide-react";
import type { TicketReportFilters } from "@/lib/types/ticket-report";
import type { Ticket } from "@/lib/types/ticket";
import type { TicketReportSummary, TicketReportTotals } from "@/lib/types/ticket-report";

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export default function TicketReportPage() {
  const defaults = getDefaultDateRange();
  const [filters, setFilters] = useState<TicketReportFilters>({
    date_from: defaults.from,
    date_to: defaults.to,
  });
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [summary, setSummary] = useState<TicketReportSummary>({ daily: [], weekly: [], monthly: [] });
  const [totals, setTotals] = useState<TicketReportTotals>({
    by_requestor: [],
    by_technician: [],
    by_department: [],
    by_asset: [],
    by_category: [],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date_from) params.set("date_from", filters.date_from);
      if (filters.date_to) params.set("date_to", filters.date_to);
      if (filters.technician_id) params.set("technician_id", filters.technician_id);
      if (filters.department_id) params.set("department_id", filters.department_id);
      if (filters.requestor_id) params.set("requestor_id", filters.requestor_id);
      if (filters.status && filters.status.length > 0) params.set("status", filters.status.join(","));

      const res = await fetch(`/api/ticket-report?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.data.tickets);
        setSummary(data.data.summary);
        setTotals(data.data.totals);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageGuard pagePath="/ticket-report">
      <div className="space-y-6">
        <ScrollReveal>
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] lg:text-3xl">
                Ticket Reports
              </h1>
              <p className="text-sm sm:text-base text-[#64748b] mt-1">
                Analyze and export ticket data across your organization
              </p>
            </div>
          </div>
        </ScrollReveal>

        <Card className="border-0 bg-white shadow-sm rounded-xl">
          <CardContent className="p-4 sm:p-6">
            <DateRangeFilter
              filters={filters}
              onFiltersChange={setFilters}
              onApply={fetchData}
            />
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm rounded-xl">
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="list">
              <TabsList>
                <TabsTrigger value="list" className="gap-1.5">
                  <List className="size-4" />
                  Ticket List
                </TabsTrigger>
                <TabsTrigger value="summary" className="gap-1.5">
                  <BarChart3 className="size-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="totals" className="gap-1.5">
                  <PieChart className="size-4" />
                  Totals
                </TabsTrigger>
                <TabsTrigger value="category" className="gap-1.5">
                  <Tag className="size-4" />
                  By Category
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-4">
                {loading ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <TicketListTab tickets={tickets} dateRange={{ from: filters.date_from, to: filters.date_to }} />
                )}
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                {loading ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <TicketSummaryTab summary={summary} dateRange={{ from: filters.date_from, to: filters.date_to }} />
                )}
              </TabsContent>

              <TabsContent value="totals" className="mt-4">
                {loading ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <TicketTotalsTab totals={totals} dateRange={{ from: filters.date_from, to: filters.date_to }} />
                )}
              </TabsContent>

              <TabsContent value="category" className="mt-4">
                {loading ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <TicketCategoryTab categories={totals.by_category} dateRange={{ from: filters.date_from, to: filters.date_to }} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageGuard>
  );
}
