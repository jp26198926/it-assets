import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportColumn {
  header: string;
  key: string;
}

export function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
  sheetName = "Report"
) {
  const worksheetData = data.map((row) => {
    const mapped: Record<string, unknown> = {};
    columns.forEach((col) => {
      mapped[col.header] = row[col.key];
    });
    return mapped;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  worksheet["!cols"] = columns.map(() => ({ wch: 20 }));

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPDF(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  title: string,
  filename: string,
  dateRange?: { from?: string; to?: string }
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  let yPos = 30;
  if (dateRange?.from || dateRange?.to) {
    const fromStr = dateRange.from || "Start";
    const toStr = dateRange.to || "End";
    doc.text(`Date Range: ${fromStr} to ${toStr}`, 14, yPos);
    yPos += 6;
  }
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPos);
  doc.text(`Total Records: ${data.length}`, 14, yPos + 6);

  const tableHeaders = columns.map((col) => col.header);
  const tableBody = data.map((row) =>
    columns.map((col) => String(row[col.key] ?? ""))
  );

  autoTable(doc, {
    startY: yPos + 14,
    head: [tableHeaders],
    body: tableBody,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`${filename}.pdf`);
}
