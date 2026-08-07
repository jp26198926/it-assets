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
import type { Supplier } from "@/lib/types/supplier";

interface SupplierExportButtonsProps {
  table: Table<Supplier>;
}

export function SupplierExportButtons({ table }: SupplierExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text("Suppliers Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

      const rows = table.getFilteredRowModel().rows.map((row) => [
        row.original.name,
        row.original.contact_person || "N/A",
        row.original.phone || "N/A",
        row.original.email || "N/A",
        row.original.address || "N/A",
        row.original.status,
        new Date(row.original.created_at).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Name", "Contact Person", "Phone", "Email", "Address", "Status", "Created"]],
        body: rows,
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("suppliers.pdf");
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
        "Contact Person": row.original.contact_person || "N/A",
        Phone: row.original.phone || "N/A",
        Email: row.original.email || "N/A",
        Address: row.original.address || "N/A",
        Status: row.original.status,
        Created: new Date(row.original.created_at).toLocaleDateString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");

      worksheet["!cols"] = [
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 35 },
        { wch: 10 },
        { wch: 15 },
      ];

      XLSX.writeFile(workbook, "suppliers.xlsx");
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
