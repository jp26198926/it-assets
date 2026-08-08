export interface Receiving {
  id: string;
  code: string;
  date_received: Date;
  supplier_id: string | null;
  supplier_name?: string;
  po_number: string | null;
  invoice_number: string | null;
  remarks: string | null;
  status: "Active" | "Completed" | "Cancelled";
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

export interface CreateReceivingInput {
  date_received: Date;
  supplier_id?: string;
  po_number?: string;
  invoice_number?: string;
  remarks?: string;
}

export interface UpdateReceivingInput {
  date_received?: Date;
  supplier_id?: string;
  po_number?: string;
  invoice_number?: string;
  remarks?: string;
}

export interface ReceivingFilters {
  search?: string;
  code?: string;
  supplier_id?: string;
  po_number?: string;
  invoice_number?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface ReceivingAdvancedFilter {
  field: keyof Receiving;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
