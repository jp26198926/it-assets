export interface Cloudinary {
  id: string;
  cloud_name: string;
  api_key: string;
  api_secret: string;
  max_file_size: number;
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface UpdateCloudinaryInput {
  cloud_name?: string;
  api_key?: string;
  api_secret?: string;
  max_file_size?: number;
}
