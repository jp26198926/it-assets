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
import { format } from "date-fns";

interface AssignmentExportButtonsProps<TData> {
  table: Table<TData>;
}

export function AssignmentExportButtons<TData>({ table }: AssignmentExportButtonsProps<TData>) {
  const formatDate = (date: unknown) => {
    if (!date) return "";
    return format(new Date(date as string), "MMM dd, yyyy");
  };

  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF("landscape");

      doc.setFontSize(18);
      doc.text("Assignment Report", 14, 22);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Records: ${table.getFilteredRowModel().rows.length}`, 14, 36);

      const headers = [
        "Asset Barcode",
        "Employee",
        "Department",
        "Assigned Date",
        "Returned Date",
        "Condition on Issue",
        "Condition on Return",
        "Status",
      ];

      const rows = table
        .getFilteredRowModel()
        .rows.map((row) => {
          const original = row.original as Record<string, unknown>;
          return [
            String(original.asset_barcode || ""),
            String(original.employee_name || ""),
            String(original.department_name || ""),
            formatDate(original.assigned_date),
            formatDate(original.returned_date),
            String(original.condition_on_issue || ""),
            String(original.condition_on_return || ""),
            String(original.status || ""),
          ];
        });

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 42,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("assignment-report.pdf");
      toast.success("PDF exported successfully");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const headers = [
        "Asset Barcode",
        "Employee",
        "Department",
        "Assigned Date",
        "Returned Date",
        "Condition on Issue",
        "Condition on Return",
        "Status",
      ];

      const rows = table
        .getFilteredRowModel()
        .rows.map((row) => {
          const original = row.original as Record<string, unknown>;
          return [
            String(original.asset_barcode || ""),
            String(original.employee_name || ""),
            String(original.department_name || ""),
            formatDate(original.assigned_date),
            formatDate(original.returned_date),
            String(original.condition_on_issue || ""),
            String(original.condition_on_return || ""),
            String(original.status || ""),
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
      XLSX.utils.book_append_sheet(wb, ws, "Assignments");
      XLSX.writeFile(wb, "assignment-report.xlsx");
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
