export interface TicketReportFilters {
  date_from?: string;
  date_to?: string;
  technician_id?: string;
  department_id?: string;
  requestor_id?: string;
  status?: string[];
}

export interface TicketSummaryItem {
  label: string;
  count: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface TicketTotalItem {
  id: string;
  name: string;
  count: number;
  serial?: string;
  barcode?: string;
}

export interface TicketReportTotals {
  by_requestor: TicketTotalItem[];
  by_technician: TicketTotalItem[];
  by_department: TicketTotalItem[];
  by_asset: TicketTotalItem[];
  by_category: TicketTotalItem[];
}

export interface TicketReportSummary {
  daily: TicketSummaryItem[];
  weekly: TicketSummaryItem[];
  monthly: TicketSummaryItem[];
}

export interface TicketReportResponse {
  tickets: unknown[];
  summary: TicketReportSummary;
  totals: TicketReportTotals;
}
