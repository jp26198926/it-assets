import { getAppSettings } from "@/lib/actions/application-actions";
import { formatInAppTimezone } from "@/lib/utils/timezone";
import type { StockLevel } from "@/lib/types/stock-level";

export async function printStockLevels(levels: StockLevel[]): Promise<void> {
  const settings = await getAppSettings();
  const companyName = settings.app_name || "Company Name";
  const companyAddress = settings.address || "";
  const companyPhone = settings.phone || "";
  const timezone = settings.timezone;

  const itemRows = levels
    .map(
      (level, index) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; font-family: monospace;">${level.item_code || "N/A"}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${level.item_name || "N/A"}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${level.location_name || "N/A"}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${level.qty.toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Stock Levels Report</title>
      <style>
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #1a1f36;
          font-size: 13px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .company-info h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1a1f36;
        }
        .company-info p {
          margin: 2px 0;
          color: #64748b;
          font-size: 12px;
        }
        .report-info {
          text-align: right;
        }
        .report-info .label {
          font-size: 12px;
          color: #64748b;
        }
        .report-info .date {
          font-size: 14px;
          font-weight: 600;
          color: #1e40af;
        }
        .divider {
          border: none;
          border-top: 3px solid #1e40af;
          margin: 12px 0;
        }
        .title {
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          color: #1e40af;
          margin: 15px 0;
          letter-spacing: 2px;
        }
        .summary {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin: 15px 0;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #f8fafc;
        }
        .summary-item {
          text-align: center;
        }
        .summary-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e40af;
        }
        .summary-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
        }
        th {
          background: #1e40af;
          color: white;
          padding: 8px;
          font-size: 11px;
          text-align: left;
          font-weight: 600;
        }
        td {
          font-size: 12px;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          color: #94a3b8;
          font-size: 10px;
        }
        .print-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #1e40af;
          color: white;
          border: none;
          padding: 10px 24px;
          font-size: 14px;
          cursor: pointer;
          border-radius: 6px;
          font-weight: 600;
          z-index: 1000;
        }
        .print-btn:hover { background: #1e3a8a; }
        @media print { .print-btn { display: none; } }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">Print</button>

      <div class="header">
        <div class="company-info">
          <h1>${companyName}</h1>
          ${companyAddress ? `<p>${companyAddress}</p>` : ""}
          ${companyPhone ? `<p>${companyPhone}</p>` : ""}
        </div>
        <div class="report-info">
          <div class="label">Report Date</div>
          <div class="date">${formatInAppTimezone(new Date(), "MMMM dd, yyyy", timezone)}</div>
        </div>
      </div>

      <hr class="divider" />

      <div class="title">STOCK LEVELS REPORT</div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${levels.length}</div>
          <div class="summary-label">Total Items</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${levels.reduce((sum, l) => sum + l.qty, 0).toLocaleString()}</div>
          <div class="summary-label">Total Quantity</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 40px;">NO</th>
            <th style="width: 100px;">ITEM CODE</th>
            <th>ITEM NAME</th>
            <th>LOCATION</th>
            <th style="text-align: right; width: 80px;">QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">No stock levels found</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        Generated on ${formatInAppTimezone(new Date(), "MM/dd/yyyy HH:mm:ss", timezone)} | This is a computer-generated document.
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
