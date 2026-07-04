export interface MeetingActionItem {
  id: string;
  meeting_id: string;
  meeting_title?: string;
  meeting_no?: number;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_to_name?: string;
  due_date: Date | null;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed" | "Cancelled" | "Deleted";
  completed_at: Date | null;
  completed_by: string | null;
  completed_by_name?: string;
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

export interface CreateMeetingActionItemInput {
  meeting_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: Date;
  priority?: "Low" | "Medium" | "High" | "Urgent";
}

export interface UpdateMeetingActionItemInput
  extends Partial<CreateMeetingActionItemInput> {
  status?: "Pending" | "In Progress" | "Completed" | "Cancelled";
}

export interface MeetingActionItemFilters {
  search?: string;
  meeting_id?: string;
  assigned_to?: string;
  priority?: string;
  status?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export interface MeetingActionItemAdvancedFilter {
  field: keyof MeetingActionItem;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
