import { connectDB } from "@/lib/db/connection";
import { Supplier as SupplierModel } from "@/lib/db/models/supplier";
import type { CreateSupplierInput, UpdateSupplierInput, SupplierFilters, Supplier } from "@/lib/types/supplier";

function toSupplier(d: Record<string, unknown>): Supplier {
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
    name: d.name as string,
    contact_person: (d.contact_person as string) ?? null,
    phone: (d.phone as string) ?? null,
    email: (d.email as string) ?? null,
    address: (d.address as string) ?? null,
    status: d.status as "Active" | "Deleted",
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

export async function getSuppliers(filters?: SupplierFilters): Promise<Supplier[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { contact_person: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.contact_person) {
    query.contact_person = { $regex: filters.contact_person, $options: "i" };
  }

  if (filters?.phone) {
    query.phone = { $regex: filters.phone, $options: "i" };
  }

  if (filters?.email) {
    query.email = { $regex: filters.email, $options: "i" };
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const suppliers = await SupplierModel.find(query)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .sort({ created_at: -1 })
    .lean();

  return suppliers.map((d) => toSupplier(d as unknown as Record<string, unknown>));
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  await connectDB();

  const supplier = await SupplierModel.findById(id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!supplier) return null;

  return toSupplier(supplier as unknown as Record<string, unknown>);
}

export async function createSupplier(data: CreateSupplierInput): Promise<Supplier> {
  await connectDB();

  const supplier = await SupplierModel.create({
    name: data.name,
    contact_person: data.contact_person || null,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    status: "Active",
  });

  const created = await SupplierModel.findById(supplier._id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!created) throw new Error("Failed to create supplier");

  return toSupplier(created as unknown as Record<string, unknown>);
}

export async function updateSupplier(id: string, data: UpdateSupplierInput): Promise<Supplier> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.contact_person !== undefined) updateData.contact_person = data.contact_person || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.address !== undefined) updateData.address = data.address || null;
  updateData.updated_at = new Date();

  const supplier = await SupplierModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!supplier) throw new Error("Supplier not found");

  return toSupplier(supplier as unknown as Record<string, unknown>);
}

export async function deleteSupplier(id: string, reason?: string): Promise<void> {
  await connectDB();

  await SupplierModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreSupplier(id: string): Promise<void> {
  await connectDB();

  await SupplierModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
