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
import type { Conversion } from "@/lib/types/conversion";

interface ConversionExportButtonsProps {
  table: Table<Conversion>;
}

export function ConversionExportButtons({ table }: ConversionExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text("Conversions Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

      const rows = table.getFilteredRowModel().rows.map((row) => [
        row.original.code,
        row.original.date_converted
          ? new Date(row.original.date_converted).toLocaleDateString()
          : "N/A",
        row.original.location_name || "N/A",
        row.original.from_item_name || "N/A",
        row.original.to_item_name || "N/A",
        row.original.from_qty,
        row.original.to_qty,
        row.original.remarks || "N/A",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Code", "Date", "Location", "From Item", "To Item", "From Qty", "To Qty", "Remarks"]],
        body: rows,
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("conversions.pdf");
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
        Code: row.original.code,
        Date: row.original.date_converted
          ? new Date(row.original.date_converted).toLocaleDateString()
          : "N/A",
        Location: row.original.location_name || "N/A",
        "From Item": row.original.from_item_name || "N/A",
        "From Item Code": row.original.from_item_code || "N/A",
        "To Item": row.original.to_item_name || "N/A",
        "To Item Code": row.original.to_item_code || "N/A",
        "From Qty": row.original.from_qty,
        "To Qty": row.original.to_qty,
        Remarks: row.original.remarks || "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Conversions");

      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 30 },
      ];

      XLSX.writeFile(workbook, "conversions.xlsx");
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
