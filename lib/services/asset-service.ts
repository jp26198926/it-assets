import { connectDB } from "@/lib/db/connection";
import { Asset as AssetModel } from "@/lib/db/models/asset";
import { Item as ItemModel } from "@/lib/db/models/item";
import { Location as LocationModel } from "@/lib/db/models/location";
import { Employee as EmployeeModel } from "@/lib/db/models/employee";
import { Department as DepartmentModel } from "@/lib/db/models/department";
import type { CreateAssetInput, UpdateAssetInput, AssetFilters, Asset } from "@/lib/types/asset";

function toAsset(d: Record<string, unknown>): Asset {
  const itemId = d.item_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string
    | null;

  let item_id: string | null = null;
  let item_name: string | undefined;
  if (itemId && typeof itemId === "object" && "_id" in itemId) {
    item_id = itemId._id.toString();
    item_name = itemId.name;
  } else if (typeof itemId === "string") {
    item_id = itemId;
  }

  const locVal = d.location_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string
    | null;

  let location_id: string | null = null;
  let location_name: string | undefined;
  if (locVal && typeof locVal === "object" && "_id" in locVal) {
    location_id = locVal._id.toString();
    location_name = locVal.name;
  } else if (typeof locVal === "string") {
    location_id = locVal;
  }

  const empVal = d.assigned_to_employee as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;

  let assigned_to_employee: string | null = null;
  let assigned_to_employee_name: string | undefined;
  if (empVal && typeof empVal === "object" && "_id" in empVal) {
    assigned_to_employee = empVal._id.toString();
    assigned_to_employee_name = `${empVal.first_name} ${empVal.last_name}`;
  } else if (typeof empVal === "string") {
    assigned_to_employee = empVal;
  }

  const deptVal = d.assigned_to_department as unknown as
    | { _id: { toString(): string }; name: string }
    | string
    | null;

  let assigned_to_department: string | null = null;
  let assigned_to_department_name: string | undefined;
  if (deptVal && typeof deptVal === "object" && "_id" in deptVal) {
    assigned_to_department = deptVal._id.toString();
    assigned_to_department_name = deptVal.name;
  } else if (typeof deptVal === "string") {
    assigned_to_department = deptVal;
  }

  const createdByVal = d.created_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let created_by: string | null = null;
  let created_by_name: string | undefined;
  if (createdByVal && typeof createdByVal === "object" && "_id" in createdByVal) {
    created_by = createdByVal._id.toString();
    created_by_name = `${createdByVal.first_name} ${createdByVal.last_name}`.trim();
  } else if (typeof createdByVal === "string") {
    created_by = createdByVal;
  }

  const updatedByVal = d.updated_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let updated_by: string | null = null;
  let updated_by_name: string | undefined;
  if (updatedByVal && typeof updatedByVal === "object" && "_id" in updatedByVal) {
    updated_by = updatedByVal._id.toString();
    updated_by_name = `${updatedByVal.first_name} ${updatedByVal.last_name}`.trim();
  } else if (typeof updatedByVal === "string") {
    updated_by = updatedByVal;
  }

  const deletedByVal = d.deleted_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let deleted_by: string | null = null;
  let deleted_by_name: string | undefined;
  if (deletedByVal && typeof deletedByVal === "object" && "_id" in deletedByVal) {
    deleted_by = deletedByVal._id.toString();
    deleted_by_name = `${deletedByVal.first_name} ${deletedByVal.last_name}`.trim();
  } else if (typeof deletedByVal === "string") {
    deleted_by = deletedByVal;
  }

  return {
    id: (d._id as { toString(): string }).toString(),
    item_id,
    item_name,
    barcode: d.barcode as string,
    serial_number: (d.serial_number as string) ?? null,
    purchase_date: (d.purchase_date as Date) ?? null,
    purchase_price: (d.purchase_price as number) ?? null,
    warranty_expiry: (d.warranty_expiry as Date) ?? null,
    location_id,
    location_name,
    assigned_to_employee,
    assigned_to_employee_name,
    assigned_to_department,
    assigned_to_department_name,
    status: d.status as "Available" | "Assigned" | "Repair" | "Lost" | "Disposed" | "Deleted",
    created_at: d.created_at as Date,
    created_by,
    created_by_name,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by,
    updated_by_name,
    deleted_at: (d.deleted_at as Date) ?? null,
    deleted_by,
    deleted_by_name,
    deleted_reason: (d.deleted_reason as string) ?? null,
  };
}

export async function getAssetSelectOptions(): Promise<{
  items: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  employees: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}> {
  await connectDB();

  const items = await ItemModel.find({ deleted_at: null, status: "Active" }).select("name").lean();
  const locations = await LocationModel.find({ deleted_at: null }).select("name").lean();
  const employees = await EmployeeModel.find({ deleted_at: null }).select("first_name last_name").lean();
  const departments = await DepartmentModel.find({ deleted_at: null }).select("name").lean();

  return {
    items: items.map((i) => ({
      id: (i._id as { toString(): string }).toString(),
      name: i.name,
    })),
    locations: locations.map((l) => ({
      id: (l._id as { toString(): string }).toString(),
      name: l.name,
    })),
    employees: employees.map((e) => ({
      id: (e._id as { toString(): string }).toString(),
      name: `${e.first_name} ${e.last_name}`,
    })),
    departments: departments.map((d) => ({
      id: (d._id as { toString(): string }).toString(),
      name: d.name,
    })),
  };
}

export async function generateBarcode(): Promise<string> {
  await connectDB();

  const year = new Date().getFullYear().toString().slice(-2);
  const pattern = `IT${year}`;

  const lastAsset = await AssetModel.findOne({
    barcode: { $regex: `^${pattern}` },
  })
    .sort({ barcode: -1 })
    .lean();

  let sequence = 1;
  if (lastAsset) {
    const lastBarcode = lastAsset.barcode;
    const lastNum = parseInt(lastBarcode.slice(-5), 10);
    if (!isNaN(lastNum)) {
      sequence = lastNum + 1;
    }
  }

  return `${pattern}${sequence.toString().padStart(5, "0")}`;
}

export async function getAssets(filters?: AssetFilters): Promise<Asset[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { barcode: { $regex: filters.search, $options: "i" } },
      { serial_number: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.barcode) {
    query.barcode = { $regex: filters.barcode, $options: "i" };
  }

  if (filters?.serial_number) {
    query.serial_number = { $regex: filters.serial_number, $options: "i" };
  }

  if (filters?.item_id) {
    query.item_id = filters.item_id;
  }

  if (filters?.location_id) {
    query.location_id = filters.location_id;
  }

  if (filters?.assigned_to_employee) {
    query.assigned_to_employee = filters.assigned_to_employee;
  }

  if (filters?.assigned_to_department) {
    query.assigned_to_department = filters.assigned_to_department;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const assets = await AssetModel.find(query)
    .populate("item_id", "name")
    .populate("location_id", "name")
    .populate("assigned_to_employee", "first_name last_name")
    .populate("assigned_to_department", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .sort({ created_at: -1 })
    .lean();

  return assets.map((d) => toAsset(d as unknown as Record<string, unknown>));
}

export async function getAssetById(id: string): Promise<Asset | null> {
  await connectDB();

  const asset = await AssetModel.findById(id)
    .populate("item_id", "name")
    .populate("location_id", "name")
    .populate("assigned_to_employee", "first_name last_name")
    .populate("assigned_to_department", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!asset) return null;

  return toAsset(asset as unknown as Record<string, unknown>);
}

export async function createAsset(data: CreateAssetInput): Promise<Asset> {
  await connectDB();

  const asset = await AssetModel.create({
    item_id: data.item_id || null,
    barcode: data.barcode,
    serial_number: data.serial_number || null,
    purchase_date: data.purchase_date ? new Date(data.purchase_date) : null,
    purchase_price: data.purchase_price ?? null,
    warranty_expiry: data.warranty_expiry ? new Date(data.warranty_expiry) : null,
    location_id: data.location_id || null,
    assigned_to_employee: data.assigned_to_employee || null,
    assigned_to_department: data.assigned_to_department || null,
    status: data.status || "Available",
  });

  const created = await AssetModel.findById(asset._id)
    .populate("item_id", "name")
    .populate("location_id", "name")
    .populate("assigned_to_employee", "first_name last_name")
    .populate("assigned_to_department", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!created) throw new Error("Failed to create asset");

  return toAsset(created as unknown as Record<string, unknown>);
}

export async function updateAsset(id: string, data: UpdateAssetInput): Promise<Asset> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.item_id !== undefined) updateData.item_id = data.item_id || null;
  if (data.barcode !== undefined) updateData.barcode = data.barcode;
  if (data.serial_number !== undefined) updateData.serial_number = data.serial_number || null;
  if (data.purchase_date !== undefined) updateData.purchase_date = data.purchase_date ? new Date(data.purchase_date) : null;
  if (data.purchase_price !== undefined) updateData.purchase_price = data.purchase_price ?? null;
  if (data.warranty_expiry !== undefined) updateData.warranty_expiry = data.warranty_expiry ? new Date(data.warranty_expiry) : null;
  if (data.location_id !== undefined) updateData.location_id = data.location_id || null;
  if (data.assigned_to_employee !== undefined) updateData.assigned_to_employee = data.assigned_to_employee || null;
  if (data.assigned_to_department !== undefined) updateData.assigned_to_department = data.assigned_to_department || null;
  if (data.status !== undefined) updateData.status = data.status;
  updateData.updated_at = new Date();

  const asset = await AssetModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("item_id", "name")
    .populate("location_id", "name")
    .populate("assigned_to_employee", "first_name last_name")
    .populate("assigned_to_department", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!asset) throw new Error("Asset not found");

  return toAsset(asset as unknown as Record<string, unknown>);
}

export async function deleteAsset(id: string, reason?: string): Promise<void> {
  await connectDB();

  await AssetModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreAsset(id: string): Promise<void> {
  await connectDB();

  await AssetModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Available",
    updated_at: new Date(),
  });
}
