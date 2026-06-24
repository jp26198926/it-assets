export interface Ticket {
  id: string;
  ticket_no: string;
  name: string;
  email: string;
  requestor_id: string | null;
  requestor_name?: string;
  title: string;
  description: string;
  category_id: string;
  category_name?: string;
  department_id: string | null;
  department_name?: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  asset_id: string | null;
  asset_name?: string;
  asset_status: string | null;
  assigned_to: string | null;
  assigned_to_name?: string;
  attachments: string[];
  status: "Open" | "In Progress" | "Resolved" | "Closed" | "Deleted";
  created_at: Date;
  created_by: string | null;
  created_by_name?: string;
  updated_at: Date | null;
  updated_by: string | null;
  updated_by_name?: string;
  deleted_at: Date | null;
  deleted_by: string | null;
  deleted_by_name?: string;
  deleted_reason: string | null;
}

export interface CreateTicketInput {
  name: string;
  email: string;
  title: string;
  description: string;
  category_id: string;
  department_id?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  asset_id?: string;
  assigned_to?: string;
  attachments?: string[];
}

export interface UpdateTicketInput extends Partial<CreateTicketInput> {
  status?: "Open" | "In Progress" | "Resolved" | "Closed";
}

export interface TicketFilters {
  search?: string;
  name?: string;
  email?: string;
  ticket_no?: string;
  category_id?: string;
  department_id?: string;
  priority?: string;
  status?: string;
  assigned_to?: string;
  asset_id?: string;
}

export interface TicketAdvancedFilter {
  field: keyof Ticket;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
