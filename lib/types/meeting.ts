export interface AgendaItem {
  id: string;
  topic: string;
  description: string | null;
  presenter: string | null;
  duration_minutes: number | null;
  notes: string | null;
}

export interface Attendee {
  id: string;
  employee_id: string;
  employee_name?: string;
  attendance_status:
    | "Pending"
    | "Accepted"
    | "Declined"
    | "Tentative"
    | "Attended"
    | "Absent";
  notes: string | null;
}

export interface Recurrence {
  frequency: "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Yearly";
  interval: number;
  end_type: "Never" | "After" | "On Date";
  end_after: number | null;
  end_date: Date | null;
  days_of_week: number[] | null;
}

export interface Meeting {
  id: string;
  meeting_no: number;
  title: string;
  description: string | null;
  meeting_type_id: string | null;
  meeting_type_name?: string;
  meeting_type_color?: string;
  scheduled_date: Date;
  start_time: string;
  end_time: string | null;
  location: string | null;
  meeting_link: string | null;
  platform: string | null;
  status:
    | "Scheduled"
    | "In Progress"
    | "Completed"
    | "Cancelled"
    | "Deleted";
  notes: string | null;
  agenda_items: AgendaItem[];
  attendees: Attendee[];
  attachments: string[];
  is_recurring: boolean;
  recurrence: Recurrence | null;
  parent_meeting_id: string | null;
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

export interface CreateMeetingInput {
  title: string;
  description?: string;
  meeting_type_id?: string;
  scheduled_date: Date;
  start_time: string;
  end_time?: string;
  location?: string;
  meeting_link?: string;
  platform?: string;
  notes?: string;
  agenda_items?: Omit<AgendaItem, "id">[];
  attendees?: Omit<Attendee, "id" | "employee_name">[];
  attachments?: string[];
  is_recurring?: boolean;
  recurrence?: Omit<Recurrence, "id"> | null;
}

export interface UpdateMeetingInput extends Partial<CreateMeetingInput> {
  status?: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
}

export interface MeetingFilters {
  search?: string;
  title?: string;
  meeting_type_id?: string;
  status?: string;
  scheduled_date_from?: string;
  scheduled_date_to?: string;
  attendee_employee_id?: string;
  location?: string;
}

export interface MeetingAdvancedFilter {
  field: keyof Meeting;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}

export interface MeetingTypeSelectOption {
  id: string;
  name: string;
  color: string | null;
}
