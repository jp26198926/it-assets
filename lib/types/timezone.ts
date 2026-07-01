export interface Timezone {
  id: string;
  name: string;
  display_name: string;
  status: "Active" | "Deleted";
  created_at: Date;
}

export interface TimezoneSelectOption {
  id: string;
  display_name: string;
}
