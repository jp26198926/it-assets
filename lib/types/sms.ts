export interface Sms {
  id: string;
  api_key: string;
  device_id: string;
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface UpdateSmsInput {
  api_key?: string;
  device_id?: string;
}
