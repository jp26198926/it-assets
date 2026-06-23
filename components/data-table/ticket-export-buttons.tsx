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
import type { Ticket } from "@/lib/types/ticket";

interface TicketExportButtonsProps {
  table: Table<Ticket>;
}

export function TicketExportButtons({ table }: TicketExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text("Tickets Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

      const rows = table.getFilteredRowModel().rows.map((row) => [
        row.original.ticket_no,
        row.original.title,
        row.original.name,
        row.original.priority,
        row.original.status,
        row.original.assigned_to_name || "Unassigned",
        new Date(row.original.created_at).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Ticket No", "Title", "Name", "Priority", "Status", "Assigned To", "Created"]],
        body: rows,
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("tickets.pdf");
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
        "Ticket No": row.original.ticket_no,
        Title: row.original.title,
        Name: row.original.name,
        Email: row.original.email,
        Priority: row.original.priority,
        Status: row.original.status,
        "Assigned To": row.original.assigned_to_name || "Unassigned",
        Created: new Date(row.original.created_at).toLocaleDateString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

      worksheet["!cols"] = [
        { wch: 12 },
        { wch: 30 },
        { wch: 20 },
        { wch: 25 },
        { wch: 10 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
      ];

      XLSX.writeFile(workbook, "tickets.xlsx");
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
