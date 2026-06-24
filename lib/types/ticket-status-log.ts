export interface TicketStatusLog {
  id: string;
  ticket_id: string;
  old_status: string;
  new_status: string;
  remarks: string;
  created_at: Date;
  created_by: string | null;
  created_by_name?: string;
}
