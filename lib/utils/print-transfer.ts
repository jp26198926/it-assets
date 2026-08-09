import { getAppSettings } from "@/lib/actions/application-actions";
import { formatInAppTimezone } from "@/lib/utils/timezone";
import type { Transfer } from "@/lib/types/transfer";
import type { TransferItem } from "@/lib/types/transfer-item";

export async function printTransfer(
  transfer: Transfer,
  items: TransferItem[]
): Promise<void> {
  const settings = await getAppSettings();
  const companyName = settings.app_name || "Company Name";
  const companyAddress = settings.address || "";
  const companyPhone = settings.phone || "";
  const timezone = settings.timezone;

  const statusColors: Record<string, string> = {
    Active: "#2563eb",
    Completed: "#059669",
    Cancelled: "#dc2626",
  };

  const itemRows = items
    .map(
      (item, index) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${item.code}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${item.item_name || "N/A"}${item.item_code ? ` - ${item.item_code}` : ""}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${item.qty.toFixed(4)}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${item.item_uom_name || "N/A"}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${item.remarks || ""}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">
          <span style="color: ${statusColors[item.status] || "#64748b"}; font-weight: 600; font-size: 11px;">
            ${item.status.toUpperCase()}
          </span>
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transfer ${transfer.code}</title>
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
        .transfer-no {
          text-align: right;
        }
        .transfer-no .label {
          font-size: 12px;
          color: #64748b;
        }
        .transfer-no .code {
          font-size: 28px;
          font-weight: 700;
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
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 40px;
          margin: 15px 0;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .info-row {
          display: flex;
          gap: 8px;
        }
        .info-label {
          font-weight: 600;
          min-width: 120px;
          color: #64748b;
        }
        .info-value {
          border-bottom: 1px dotted #d1d5db;
          flex: 1;
          padding-bottom: 2px;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: white;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e40af;
          margin: 15px 0 8px 0;
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
        .remarks-box {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          margin: 15px 0;
          min-height: 40px;
        }
        .remarks-label {
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 4px;
        }
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 30px;
        }
        .sig-block {
          text-align: center;
        }
        .sig-line {
          border-top: 1px solid #1a1f36;
          margin-top: 50px;
          padding-top: 6px;
        }
        .sig-name {
          font-weight: 600;
          font-size: 12px;
        }
        .sig-title {
          color: #64748b;
          font-size: 11px;
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
        <div class="transfer-no">
          <div class="label">Transfer No.</div>
          <div class="code">${transfer.code}</div>
        </div>
      </div>

      <hr class="divider" />

      <div class="title">TRANSFER</div>

      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${formatInAppTimezone(transfer.date_transferred, "yyyy-MM-dd", timezone)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value">
            <span class="status-badge" style="background: ${statusColors[transfer.status] || "#64748b"}">
              ${transfer.status.toUpperCase()}
            </span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">From Location:</span>
          <span class="info-value">${transfer.from_location_name || "N/A"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">To Location:</span>
          <span class="info-value">${transfer.to_location_name || "N/A"}</span>
        </div>
      </div>

      <div class="section-title">Transfer Items</div>
      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 40px;">NO</th>
            <th style="text-align: center; width: 80px;">SERIES #</th>
            <th>ITEM DESCRIPTION</th>
            <th style="text-align: right; width: 70px;">QTY</th>
            <th style="text-align: center; width: 70px;">UOM</th>
            <th style="width: 80px;">REMARKS</th>
            <th style="text-align: center; width: 80px;">STATUS</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows || '<tr><td colspan="7" style="padding: 20px; text-align: center; color: #94a3b8;">No items</td></tr>'}
        </tbody>
      </table>

      <div class="remarks-box">
        <div class="remarks-label">REMARKS:</div>
        <div>${transfer.remarks || ""}</div>
      </div>

      <div class="signatures">
        <div class="sig-block">
          <div class="sig-line">
            <div class="sig-name">Prepared By:</div>
            <div class="sig-title">Staff Signature</div>
          </div>
        </div>
        <div class="sig-block">
          <div class="sig-line">
            <div class="sig-name">Received By:</div>
            <div class="sig-title">Authorized Signature</div>
          </div>
        </div>
      </div>

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
