"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Table } from "@tanstack/react-table";
import type { Item } from "@/lib/types/item";

interface ItemExportButtonsProps {
  table: Table<Item>;
}

export function ItemExportButtons({ table }: ItemExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text("Items Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

      const rows = table.getFilteredRowModel().rows.map((row) => [
        row.original.name,
        row.original.category_name || "N/A",
        row.original.brand || "N/A",
        row.original.model || "N/A",
        row.original.uom_name || "N/A",
        String(row.original.minimum_stock),
        row.original.status,
        new Date(row.original.created_at).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Name", "Category", "Brand", "Model", "UOM", "Min Stock", "Status", "Created"]],
        body: rows,
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("items.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setExporting(null);
    }
  };

  const exportExcel = async () => {
    setExporting("excel");
    try {
      const XLSX = await import("xlsx");

      const rows = table.getFilteredRowModel().rows.map((row) => ({
        Name: row.original.name,
        Category: row.original.category_name || "N/A",
        Brand: row.original.brand || "N/A",
        Model: row.original.model || "N/A",
        UOM: row.original.uom_name || "N/A",
        "Min Stock": row.original.minimum_stock,
        Status: row.original.status,
        Created: new Date(row.original.created_at).toLocaleDateString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Items");

      worksheet["!cols"] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
      ];

      XLSX.writeFile(workbook, "items.xlsx");
    } catch (error) {
      console.error("Excel export failed:", error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8" disabled={!!exporting}>
          <Download className="mr-1 h-4 w-4" />
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportPDF} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportExcel} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
