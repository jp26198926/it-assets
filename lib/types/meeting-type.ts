export interface MeetingType {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
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

export interface CreateMeetingTypeInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateMeetingTypeInput extends Partial<CreateMeetingTypeInput> {}

export interface MeetingTypeFilters {
  search?: string;
  name?: string;
  description?: string;
  status?: string;
}

export interface MeetingTypeAdvancedFilter {
  field: keyof MeetingType;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}

export interface MeetingTypeSelectOption {
  id: string;
  name: string;
  color: string | null;
}
