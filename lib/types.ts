export type AssetStatus = "Active" | "In Use" | "Maintenance" | "Retired" | "Available";
export type AssetType = "Laptop" | "Desktop" | "Monitor" | "Server" | "Printer" | "Network Device";

export interface ITAsset {
  id: string;
  assetTag: string;
  name: string;
  type: AssetType;
  brand: string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  assignedTo: string | null;
  location: string;
  department: string;
  purchaseDate: string;
  warrantyExpiry: string;
  purchaseCost: number;
  notes: string;
  isDeleted: boolean;
}

export interface AdvancedFilter {
  field: keyof ITAsset;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
