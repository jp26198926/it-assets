import { connectDB } from "@/lib/db/connection";
import { UOM as UOMModel } from "@/lib/db/models/uom";
import type { CreateUOMInput, UpdateUOMInput, UOMFilters, UOM } from "@/lib/types/uom";

function toUOM(d: Record<string, unknown>): UOM {
  return {
    id: (d._id as { toString(): string }).toString(),
    code: d.code as string,
    name: d.name as string,
    status: d.status as "Active" | "Deleted",
    created_at: d.created_at as Date,
    created_by: d.created_by ? (d.created_by as { toString(): string }).toString() : null,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by: d.updated_by ? (d.updated_by as { toString(): string }).toString() : null,
    deleted_at: (d.deleted_at as Date) ?? null,
  };
}

export async function getUOMs(filters?: UOMFilters): Promise<UOM[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { code: { $regex: filters.search, $options: "i" } },
      { name: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.code) {
    query.code = { $regex: filters.code, $options: "i" };
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const uoms = await UOMModel.find(query)
    .sort({ created_at: -1 })
    .lean();

  return uoms.map((d) => toUOM(d as unknown as Record<string, unknown>));
}

export async function getUOMById(id: string): Promise<UOM | null> {
  await connectDB();

  const uom = await UOMModel.findById(id).lean();

  if (!uom) return null;

  return toUOM(uom as unknown as Record<string, unknown>);
}

export async function createUOM(data: CreateUOMInput): Promise<UOM> {
  await connectDB();

  const uom = await UOMModel.create({
    code: data.code,
    name: data.name,
    status: "Active",
  });

  const created = await UOMModel.findById(uom._id).lean();

  if (!created) throw new Error("Failed to create UOM");

  return toUOM(created as unknown as Record<string, unknown>);
}

export async function updateUOM(id: string, data: UpdateUOMInput): Promise<UOM> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.code !== undefined) updateData.code = data.code;
  if (data.name !== undefined) updateData.name = data.name;
  updateData.updated_at = new Date();

  const uom = await UOMModel.findByIdAndUpdate(id, updateData, { new: true })
    .lean();

  if (!uom) throw new Error("UOM not found");

  return toUOM(uom as unknown as Record<string, unknown>);
}

export async function deleteUOM(id: string, reason?: string): Promise<void> {
  await connectDB();

  await UOMModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreUOM(id: string): Promise<void> {
  await connectDB();

  await UOMModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
