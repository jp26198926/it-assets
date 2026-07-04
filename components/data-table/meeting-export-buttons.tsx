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
import type { Meeting } from "@/lib/types/meeting";

interface MeetingExportButtonsProps {
  table: Table<Meeting>;
}

export function MeetingExportButtons({ table }: MeetingExportButtonsProps) {
  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF("landscape");

      doc.setFontSize(18);
      doc.text("Meeting Report", 14, 22);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Records: ${table.getFilteredRowModel().rows.length}`, 14, 36);

      const headers = [
        "No.",
        "Title",
        "Type",
        "Date",
        "Time",
        "Location",
        "Attendees",
        "Status",
      ];

      const rows = table
        .getFilteredRowModel()
        .rows.map((row) => {
          const m = row.original;
          return [
            String(m.meeting_no || ""),
            String(m.title || ""),
            String(m.meeting_type_name || "N/A"),
            m.scheduled_date ? new Date(m.scheduled_date).toLocaleDateString() : "",
            `${m.start_time || ""}${m.end_time ? ` - ${m.end_time}` : ""}`,
            String(m.location || "N/A"),
            String(m.attendees?.length || 0),
            String(m.status || ""),
          ];
        });

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 42,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save("meeting-report.pdf");
      toast.success("PDF exported successfully");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const headers = [
        "No.",
        "Title",
        "Type",
        "Date",
        "Time",
        "Location",
        "Platform",
        "Attendees",
        "Status",
      ];

      const rows = table
        .getFilteredRowModel()
        .rows.map((row) => {
          const m = row.original;
          return [
            String(m.meeting_no || ""),
            String(m.title || ""),
            String(m.meeting_type_name || ""),
            m.scheduled_date ? new Date(m.scheduled_date).toLocaleDateString() : "",
            `${m.start_time || ""}${m.end_time ? ` - ${m.end_time}` : ""}`,
            String(m.location || ""),
            String(m.platform || ""),
            String(m.attendees?.length || 0),
            String(m.status || ""),
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
      XLSX.utils.book_append_sheet(wb, ws, "Meetings");
      XLSX.writeFile(wb, "meeting-report.xlsx");
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
