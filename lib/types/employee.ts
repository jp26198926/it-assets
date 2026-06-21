export interface Employee {
  id: string;
  emp_no: string | null;
  firstname: string;
  middlename: string | null;
  lastname: string;
  email: string | null;
  contact_no: string | null;
  department_id: string | null;
  department_name?: string;
  status: "Active" | "Deleted";
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface CreateEmployeeInput {
  emp_no?: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  email?: string;
  contact_no?: string;
  department_id?: string;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {}

export interface EmployeeFilters {
  search?: string;
  emp_no?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  email?: string;
  contact_no?: string;
  status?: string;
}

export interface EmployeeAdvancedFilter {
  field: keyof Employee;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
