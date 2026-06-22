export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: boolean;
  phone_verified_at: Date | null;
  department_id: string | null;
  department_name?: string;
  role_id: string;
  role_name?: string;
  status: "Active" | "Deleted" | "Inactive";
  is_verified: boolean;
  email_verified_at: Date | null;
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

export interface CreateUserInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  department_id?: string;
  role_id: string;
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  department_id?: string;
  role_id?: string;
}

export interface ProfileUpdateInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  email_otp?: string;
  phone?: string;
  phone_otp?: string;
  avatar_url?: string | null;
}

export interface UserFilters {
  search?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  status?: string;
}

export interface UserAdvancedFilter {
  field: keyof User;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}

export interface UserSelectItem {
  id: string;
  name: string;
}
