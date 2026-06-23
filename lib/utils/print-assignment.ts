import { format } from "date-fns";
import type { Assignment } from "@/lib/types/assignment";
import { getAppSettings } from "@/lib/actions/application-actions";

export async function printAssignment(assignment: Assignment) {
  let appName = "";
  try {
    const settings = await getAppSettings();
    appName = settings.app_name;
  } catch {}

  const win = window.open("", "_blank", "width=800,height=700");
  if (!win) return;

  const fmt = (d: Date | null | undefined) =>
    d ? format(new Date(d), "MMMM dd, yyyy") : "—";

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Assignment - ${assignment.asset_barcode || "N/A"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #1a1f36; }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-left: 8px; }
    .badge-active { background: #d1fae5; color: #059669; }
    .badge-returned { background: #dbeafe; color: #2563eb; }
    .badge-lost { background: #fef3c7; color: #d97706; }
    .badge-deleted { background: #fee2e2; color: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; border-bottom: 2px solid #e2e8f0; background: #f8fafc; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .label { color: #64748b; font-weight: 500; width: 180px; }
    .audit { margin-top: 24px; }
    .audit h2 { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #64748b; }
    @media print {
      body { padding: 16px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:right;margin-bottom:16px;">
    <button onclick="window.print()" style="padding:6px 16px;cursor:pointer;border:1px solid #e2e8f0;border-radius:6px;background:#fff;font-size:13px;">Print</button>
  </div>
  ${appName ? `<h2 style="font-size:16px;font-weight:600;margin-bottom:2px;">${appName}</h2>` : ""}
  <h1>Assignment Details<span class="badge badge-${(assignment.status || "Active").toLowerCase()}">${assignment.status}</span></h1>
  <p class="subtitle">Asset: ${assignment.asset_barcode || "N/A"}</p>

  <table>
    <tr><th colspan="2">Assignment Information</th></tr>
    <tr><td class="label">Asset Barcode</td><td>${assignment.asset_barcode || "N/A"}</td></tr>
    <tr><td class="label">Item</td><td>${assignment.item_name || "—"}</td></tr>
    <tr><td class="label">Serial No.</td><td>${assignment.serial_number || "—"}</td></tr>
    <tr><td class="label">Category</td><td>${assignment.item_category_name || "—"}</td></tr>
    <tr><td class="label">Employee</td><td>${assignment.employee_name || "—"}</td></tr>
    <tr><td class="label">Department</td><td>${assignment.department_name || "—"}</td></tr>
    <tr><td class="label">Assigned Date</td><td>${fmt(assignment.assigned_date)}</td></tr>
    <tr><td class="label">Condition on Issue</td><td>${assignment.condition_on_issue}</td></tr>
    ${assignment.condition_on_return ? `<tr><td class="label">Condition on Return</td><td>${assignment.condition_on_return}</td></tr>` : ""}
    ${assignment.returned_date ? `<tr><td class="label">Returned Date</td><td>${fmt(assignment.returned_date)}</td></tr>` : ""}
    ${assignment.date_lost ? `<tr><td class="label">Date Lost</td><td>${fmt(assignment.date_lost)}</td></tr>` : ""}
    ${assignment.lost_reason ? `<tr><td class="label">Lost Reason</td><td>${assignment.lost_reason}</td></tr>` : ""}
    ${assignment.remarks ? `<tr><td class="label">Remarks</td><td>${assignment.remarks}</td></tr>` : ""}
  </table>

  <div class="audit">
    <h2>Audit Trail</h2>
    <table>
      <tr><td class="label">Created At</td><td>${fmt(assignment.created_at)}</td></tr>
      <tr><td class="label">Created By</td><td>${assignment.created_by_name || "N/A"}</td></tr>
      <tr><td class="label">Last Updated</td><td>${assignment.updated_at ? fmt(assignment.updated_at) : "Never"}</td></tr>
      <tr><td class="label">Updated By</td><td>${assignment.updated_by_name || "N/A"}</td></tr>
      ${assignment.deleted_at ? `<tr><td class="label">Deleted At</td><td>${fmt(assignment.deleted_at)}</td></tr>` : ""}
      ${assignment.deleted_by_name ? `<tr><td class="label">Deleted By</td><td>${assignment.deleted_by_name}</td></tr>` : ""}
      ${assignment.deleted_reason ? `<tr><td class="label">Delete Reason</td><td>${assignment.deleted_reason}</td></tr>` : ""}
    </table>
  </div>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}
