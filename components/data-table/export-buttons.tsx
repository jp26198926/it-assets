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

interface ExportButtonsProps<TData> {
  table: Table<TData>;
}

export function ExportButtons<TData>({ table }: ExportButtonsProps<TData>) {
  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF("landscape");

      doc.setFontSize(18);
      doc.text("IT Asset Report", 14, 22);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Records: ${table.getFilteredRowModel().rows.length}`, 14, 36);

      const headers = [
        "Asset Tag",
        "Name",
        "Type",
        "Brand",
        "Model",
        "Status",
        "Assigned To",
        "Location",
        "Purchase Date",
        "Warranty Expiry",
        "Cost",
      ];

      const rows = table
        .getFilteredRowModel()
        .rows.map((row) => {
          const original = row.original as Record<string, unknown>;
          return [
            String(original.assetTag || ""),
            String(original.name || ""),
            String(original.type || ""),
            String(original.brand || ""),
            String(original.model || ""),
            String(original.status || ""),
            String(original.assignedTo || "Unassigned"),
            String(original.location || ""),
            String(original.purchaseDate || ""),
            String(original.warrantyExpiry || ""),
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(original.purchaseCost as number),
          ];
        });

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 42,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("it-asset-report.pdf");
      toast.success("PDF exported successfully");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const headers = [
        "Asset Tag",
        "Name",
        "Type",
        "Brand",
        "Model",
        "Serial Number",
        "Status",
        "Assigned To",
        "Location",
        "Department",
        "Purchase Date",
        "Warranty Expiry",
        "Cost",
        "Notes",
      ];

      const rows = table
        .getFilteredRowModel()
        .rows.map((row) => {
          const original = row.original as Record<string, unknown>;
          return [
            String(original.assetTag || ""),
            String(original.name || ""),
            String(original.type || ""),
            String(original.brand || ""),
            String(original.model || ""),
            String(original.serialNumber || ""),
            String(original.status || ""),
            String(original.assignedTo || "Unassigned"),
            String(original.location || ""),
            String(original.department || ""),
            String(original.purchaseDate || ""),
            String(original.warrantyExpiry || ""),
            String(original.purchaseCost || ""),
            String(original.notes || ""),
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
      XLSX.utils.book_append_sheet(wb, ws, "Assets");
      XLSX.writeFile(wb, "it-asset-report.xlsx");
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
