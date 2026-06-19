export interface Application {
  id: string;
  app_name: string;
  tagline: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tin_number: string | null;
  otp_expiry_duration: number;
  android_download_link: string | null;
  ios_download_link: string | null;
  facebook_link: string | null;
  x_link: string | null;
  instagram_link: string | null;
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface UpdateApplicationInput {
  app_name?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  tin_number?: string;
  otp_expiry_duration?: number;
  android_download_link?: string;
  ios_download_link?: string;
  facebook_link?: string;
  x_link?: string;
  instagram_link?: string;
}
