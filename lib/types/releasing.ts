export interface Releasing {
  id: string;
  code: string;
  date_released: Date;
  from_location_id: string | null;
  from_location_name?: string;
  to_department_id: string | null;
  to_department_name?: string;
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

export interface CreateReleasingInput {
  date_released: Date;
  from_location_id?: string;
  to_department_id?: string;
  remarks?: string;
}

export interface UpdateReleasingInput {
  date_released?: Date;
  from_location_id?: string;
  to_department_id?: string;
  remarks?: string;
}

export interface ReleasingFilters {
  search?: string;
  code?: string;
  from_location_id?: string;
  to_department_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}
