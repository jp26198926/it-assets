export interface TicketComment {
  id: string;
  ticket_id: string;
  replied_to: string | null;
  message: string;
  attachments: string[];
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

export interface CreateTicketCommentInput {
  ticket_id: string;
  message: string;
  attachments?: string[];
  replied_to?: string | null;
}
