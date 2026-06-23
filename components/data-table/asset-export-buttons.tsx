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
import type { Asset } from "@/lib/types/asset";

interface AssetExportButtonsProps {
  table: Table<Asset>;
}

export function AssetExportButtons({ table }: AssetExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text("Assets Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

      const rows = table.getFilteredRowModel().rows.map((row) => [
        row.original.barcode,
        row.original.item_name || "N/A",
        row.original.item_brand || "N/A",
        row.original.item_model || "N/A",
        row.original.item_category_name || "N/A",
        row.original.serial_number || "N/A",
        row.original.assigned_to_employee_name || "Unassigned",
        row.original.assigned_to_department_name || "N/A",
        row.original.status,
        row.original.purchase_price ? `$${row.original.purchase_price.toFixed(2)}` : "N/A",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Barcode", "Item", "Brand", "Model", "Category", "Serial Number", "Assigned To", "Department", "Status", "Price"]],
        body: rows,
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("assets.pdf");
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
        Barcode: row.original.barcode,
        Item: row.original.item_name || "N/A",
        Brand: row.original.item_brand || "N/A",
        Model: row.original.item_model || "N/A",
        Category: row.original.item_category_name || "N/A",
        "Serial Number": row.original.serial_number || "N/A",
        "Assigned To": row.original.assigned_to_employee_name || "Unassigned",
        Department: row.original.assigned_to_department_name || "N/A",
        Status: row.original.status,
        "Purchase Price": row.original.purchase_price || "N/A",
        "Purchase Date": row.original.purchase_date
          ? new Date(row.original.purchase_date).toLocaleDateString()
          : "N/A",
        "Warranty Expiry": row.original.warranty_expiry
          ? new Date(row.original.warranty_expiry).toLocaleDateString()
          : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
      ];

      XLSX.writeFile(workbook, "assets.xlsx");
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
