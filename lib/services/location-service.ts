import { connectDB } from "@/lib/db/connection";
import { Location as LocationModel } from "@/lib/db/models/location";
import type { CreateLocationInput, UpdateLocationInput, LocationFilters, Location } from "@/lib/types/location";

function toLocation(d: Record<string, unknown>): Location {
  return {
    id: (d._id as { toString(): string }).toString(),
    name: d.name as string,
    status: d.status as "Active" | "Deleted",
    created_at: d.created_at as Date,
    created_by: d.created_by ? (d.created_by as { toString(): string }).toString() : null,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by: d.updated_by ? (d.updated_by as { toString(): string }).toString() : null,
    deleted_at: (d.deleted_at as Date) ?? null,
    deleted_by: d.deleted_by ? (d.deleted_by as { toString(): string }).toString() : null,
    deleted_reason: (d.deleted_reason as string) ?? null,
  };
}

export async function getLocations(filters?: LocationFilters): Promise<Location[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const locations = await LocationModel.find(query)
    .sort({ created_at: -1 })
    .lean();

  return locations.map((d) => toLocation(d as unknown as Record<string, unknown>));
}

export async function getLocationById(id: string): Promise<Location | null> {
  await connectDB();

  const location = await LocationModel.findById(id).lean();

  if (!location) return null;

  return toLocation(location as unknown as Record<string, unknown>);
}

export async function createLocation(data: CreateLocationInput): Promise<Location> {
  await connectDB();

  const location = await LocationModel.create({
    name: data.name,
    status: "Active",
  });

  const created = await LocationModel.findById(location._id).lean();

  if (!created) throw new Error("Failed to create location");

  return toLocation(created as unknown as Record<string, unknown>);
}

export async function updateLocation(id: string, data: UpdateLocationInput): Promise<Location> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  updateData.updated_at = new Date();

  const location = await LocationModel.findByIdAndUpdate(id, updateData, { new: true })
    .lean();

  if (!location) throw new Error("Location not found");

  return toLocation(location as unknown as Record<string, unknown>);
}

export async function deleteLocation(id: string, reason?: string): Promise<void> {
  await connectDB();

  await LocationModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreLocation(id: string): Promise<void> {
  await connectDB();

  await LocationModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
