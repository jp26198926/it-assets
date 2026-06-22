export interface Item {
  id: string;
  name: string;
  item_code: string | null;
  category_id: string | null;
  category_name?: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  uom_id: string | null;
  uom_name?: string;
  uom_code?: string;
  minimum_stock: number;
  image_url: string | null;
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

export interface CreateItemInput {
  name: string;
  category_id?: string;
  brand?: string;
  model?: string;
  description?: string;
  uom_id?: string;
  minimum_stock?: number;
  image_url?: string;
  created_by?: string;
}

export interface UpdateItemInput extends Partial<CreateItemInput> {
  updated_by?: string;
}

export interface ItemFilters {
  search?: string;
  name?: string;
  item_code?: string;
  category_id?: string;
  brand?: string;
  model?: string;
  uom_id?: string;
  status?: string;
}

export interface ItemAdvancedFilter {
  field: keyof Item;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
