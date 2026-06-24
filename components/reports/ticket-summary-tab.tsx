"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/utils/report-export";
import type { TicketReportSummary } from "@/lib/types/ticket-report";

interface TicketSummaryTabProps {
  summary: TicketReportSummary;
  dateRange: { from?: string; to?: string };
}

type Period = "daily" | "weekly" | "monthly";

export function TicketSummaryTab({ summary, dateRange }: TicketSummaryTabProps) {
  const [period, setPeriod] = useState<Period>("daily");
  const data = summary[period];

  const handleExportExcel = () => {
    exportToExcel(
      data.map((d) => ({
        label: d.label,
        count: d.count,
        open: d.open,
        in_progress: d.in_progress,
        resolved: d.resolved,
        closed: d.closed,
      })),
      [
        { header: "Period", key: "label" },
        { header: "Total", key: "count" },
        { header: "Open", key: "open" },
        { header: "In Progress", key: "in_progress" },
        { header: "Resolved", key: "resolved" },
        { header: "Closed", key: "closed" },
      ],
      `ticket-summary-${period}`
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      data.map((d) => ({
        label: d.label,
        count: d.count,
        open: d.open,
        in_progress: d.in_progress,
        resolved: d.resolved,
        closed: d.closed,
      })),
      [
        { header: "Period", key: "label" },
        { header: "Total", key: "count" },
        { header: "Open", key: "open" },
        { header: "In Progress", key: "in_progress" },
        { header: "Resolved", key: "resolved" },
        { header: "Closed", key: "closed" },
      ],
      `Ticket Summary (${period})`,
      `ticket-summary-${period}`,
      dateRange
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExportExcel}>
            <Download className="size-4" />
            Excel
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportPDF}>
            <Download className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No data available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="open" stackId="a" fill="#3b82f6" name="Open" />
              <Bar dataKey="in_progress" stackId="a" fill="#eab308" name="In Progress" />
              <Bar dataKey="resolved" stackId="a" fill="#22c55e" name="Resolved" />
              <Bar dataKey="closed" stackId="a" fill="#6b7280" name="Closed" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Open</TableHead>
              <TableHead className="text-right">In Progress</TableHead>
              <TableHead className="text-right">Resolved</TableHead>
              <TableHead className="text-right">Closed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No data available.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.label}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="text-right font-semibold">{item.count}</TableCell>
                  <TableCell className="text-right">{item.open}</TableCell>
                  <TableCell className="text-right">{item.in_progress}</TableCell>
                  <TableCell className="text-right">{item.resolved}</TableCell>
                  <TableCell className="text-right">{item.closed}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
