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
import type { Transfer } from "@/lib/types/transfer";

interface TransferExportButtonsProps {
  table: Table<Transfer>;
}

export function TransferExportButtons({ table }: TransferExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text("Transfers Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

      const rows = table.getFilteredRowModel().rows.map((row) => [
        row.original.code,
        new Date(row.original.date_transferred).toLocaleDateString(),
        row.original.from_location_name || "N/A",
        row.original.to_location_name || "N/A",
        row.original.status,
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Code", "Date Transferred", "From Location", "To Location", "Status"]],
        body: rows,
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("transfers.pdf");
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
        "Date Transferred": new Date(row.original.date_transferred).toLocaleDateString(),
        "From Location": row.original.from_location_name || "N/A",
        "To Location": row.original.to_location_name || "N/A",
        Status: row.original.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transfers");

      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 25 },
        { wch: 12 },
      ];

      XLSX.writeFile(workbook, "transfers.xlsx");
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
