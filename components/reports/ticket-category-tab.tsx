"use client";

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
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/utils/report-export";
import type { TicketTotalItem } from "@/lib/types/ticket-report";

interface TicketCategoryTabProps {
  categories: TicketTotalItem[];
  dateRange: { from?: string; to?: string };
}

export function TicketCategoryTab({ categories, dateRange }: TicketCategoryTabProps) {
  const handleExportExcel = () => {
    exportToExcel(
      categories.map((c) => ({ name: c.name, count: c.count })),
      [
        { header: "Category", key: "name" },
        { header: "Total Tickets", key: "count" },
      ],
      "ticket-by-category"
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      categories.map((c) => ({ name: c.name, count: c.count })),
      [
        { header: "Category", key: "name" },
        { header: "Total Tickets", key: "count" },
      ],
      "Tickets by Category",
      "ticket-by-category",
      dateRange
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
        </p>
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
        {categories.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Total Tickets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                  No data available.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right font-semibold">{item.count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
