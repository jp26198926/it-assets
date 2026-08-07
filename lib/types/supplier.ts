export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: "Active" | "Deleted";
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

export interface CreateSupplierInput {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

export interface SupplierFilters {
  search?: string;
  name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export interface SupplierAdvancedFilter {
  field: keyof Supplier;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
