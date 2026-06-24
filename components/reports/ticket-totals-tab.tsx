"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Download } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/utils/report-export";
import type { TicketReportTotals } from "@/lib/types/ticket-report";

interface TicketTotalsTabProps {
  totals: TicketReportTotals;
  dateRange: { from?: string; to?: string };
}

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

type TotalSection = "by_requestor" | "by_technician" | "by_department" | "by_asset";

const sectionLabels: Record<TotalSection, string> = {
  by_requestor: "By Requestor",
  by_technician: "By Technician",
  by_department: "By Department",
  by_asset: "By Asset",
};

export function TicketTotalsTab({ totals, dateRange }: TicketTotalsTabProps) {
  const [activeSection, setActiveSection] = useState<TotalSection>("by_requestor");
  const data = totals[activeSection];

  const handleExportExcel = () => {
    const isAsset = activeSection === "by_asset";
    const rows = data.map((d) => ({
      name: d.name,
      ...(isAsset ? { barcode: d.barcode || "" } : {}),
      ...(isAsset ? { serial: d.serial || "" } : {}),
      count: d.count,
    }));
    const cols = [
      { header: "Name", key: "name" },
      ...(isAsset ? [{ header: "Barcode", key: "barcode" }] : []),
      ...(isAsset ? [{ header: "Serial Number", key: "serial" }] : []),
      { header: "Total Tickets", key: "count" },
    ];
    exportToExcel(rows, cols, `ticket-totals-${activeSection}`);
  };

  const handleExportPDF = () => {
    const isAsset = activeSection === "by_asset";
    const rows = data.map((d) => ({
      name: d.name,
      ...(isAsset ? { barcode: d.barcode || "" } : {}),
      ...(isAsset ? { serial: d.serial || "" } : {}),
      count: d.count,
    }));
    const cols = [
      { header: "Name", key: "name" },
      ...(isAsset ? [{ header: "Barcode", key: "barcode" }] : []),
      ...(isAsset ? [{ header: "Serial Number", key: "serial" }] : []),
      { header: "Total Tickets", key: "count" },
    ];
    exportToPDF(rows, cols, `Ticket Totals - ${sectionLabels[activeSection]}`, `ticket-totals-${activeSection}`, dateRange);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(Object.keys(sectionLabels) as TotalSection[]).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={activeSection === s ? "default" : "outline"}
              onClick={() => setActiveSection(s)}
            >
              {sectionLabels[s]}
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{sectionLabels[activeSection]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {data.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="name"
                    >
                      {data.slice(0, 8).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {activeSection === "by_asset" && <TableHead>Barcode</TableHead>}
                {activeSection === "by_asset" && <TableHead>Serial Number</TableHead>}
                <TableHead className="text-right">Total Tickets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeSection === "by_asset" ? 4 : 2} className="h-24 text-center text-muted-foreground">
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    {activeSection === "by_asset" && (
                      <TableCell className="font-mono text-sm">{item.barcode || "—"}</TableCell>
                    )}
                    {activeSection === "by_asset" && (
                      <TableCell className="text-sm text-muted-foreground">{item.serial || "—"}</TableCell>
                    )}
                    <TableCell className="text-right font-semibold">{item.count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
