export interface DashboardAssetStatus {
  total: number;
  available: number;
  assigned: number;
  repair: number;
  lost: number;
  disposed: number;
}

export interface DashboardTicketStatus {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface DashboardAssignmentStatus {
  active: number;
  returned: number;
  lost: number;
}

export interface DashboardRecentAsset {
  id: string;
  barcode: string;
  item_name: string;
  category_name: string;
  location_name: string;
  assigned_to_employee_name: string;
  status: string;
  created_at: Date;
}

export interface DashboardRecentTicket {
  id: string;
  ticket_no: string;
  title: string;
  priority: string;
  status: string;
  assigned_to_name: string;
  created_at: Date;
}

export interface DashboardNameCount {
  name: string;
  count: number;
}

export interface DashboardTrendPoint {
  date: string;
  count: number;
}

export interface DashboardStats {
  assets: DashboardAssetStatus;
  tickets: DashboardTicketStatus;
  assignments: DashboardAssignmentStatus;
  recentAssets: DashboardRecentAsset[];
  recentTickets: DashboardRecentTicket[];
  assetByCategory: DashboardNameCount[];
  assetByLocation: DashboardNameCount[];
  ticketByPriority: DashboardNameCount[];
  ticketTrend: DashboardTrendPoint[];
}
