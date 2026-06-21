"use client";

import { type Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UOMExportButtonsProps<TData> {
  table: Table<TData>;
}

export function UOMExportButtons<TData>({ table }: UOMExportButtonsProps<TData>) {
  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF("landscape");

      doc.setFontSize(18);
      doc.text("UOM Report", 14, 22);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Records: ${table.getFilteredRowModel().rows.length}`, 14, 36);

      const headers = [
        "Code",
        "Name",
        "Status",
        "Created",
      ];

      const rows = table
        .getFilteredRowModel()
        .rows.map((row) => {
          const original = row.original as Record<string, unknown>;
          return [
            String(original.code || ""),
            String(original.name || ""),
            String(original.status || ""),
            original.created_at ? new Date(original.created_at as string).toLocaleDateString() : "",
          ];
        });

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 42,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("uom-report.pdf");
      toast.success("PDF exported successfully");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const headers = [
        "Code",
        "Name",
        "Status",
        "Created",
      ];

      const rows = table
        .getFilteredRowModel()
        .rows.map((row) => {
          const original = row.original as Record<string, unknown>;
          return [
            String(original.code || ""),
            String(original.name || ""),
            String(original.status || ""),
            original.created_at ? new Date(original.created_at as string).toLocaleDateString() : "",
          ];
        });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      const colWidths = headers.map((_, i) => ({
        wch: Math.max(
          headers[i].length,
          ...rows.map((row) => String(row[i] || "").length)
        ),
      }));
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "UOMs");
      XLSX.writeFile(wb, "uom-report.xlsx");
      toast.success("Excel exported successfully");
    } catch {
      toast.error("Failed to export Excel");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Download className="mr-1 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          Export to PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          Export to Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
