import { connectDB } from "@/lib/db/connection";
import { TicketCategory as TicketCategoryModel } from "@/lib/db/models/ticket-category";
import type { CreateTicketCategoryInput, UpdateTicketCategoryInput, TicketCategoryFilters, TicketCategory } from "@/lib/types/ticket-category";

function toTicketCategory(d: Record<string, unknown>): TicketCategory {
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

export async function getTicketCategories(filters?: TicketCategoryFilters): Promise<TicketCategory[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.name = { $regex: filters.search, $options: "i" };
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const ticketCategories = await TicketCategoryModel.find(query)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .sort({ created_at: -1 })
    .lean();

  return ticketCategories.map((d) => toTicketCategory(d as unknown as Record<string, unknown>));
}

export async function getTicketCategoryById(id: string): Promise<TicketCategory | null> {
  await connectDB();

  const ticketCategory = await TicketCategoryModel.findById(id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!ticketCategory) return null;

  return toTicketCategory(ticketCategory as unknown as Record<string, unknown>);
}

export async function createTicketCategory(data: CreateTicketCategoryInput): Promise<TicketCategory> {
  await connectDB();

  const ticketCategory = await TicketCategoryModel.create({
    name: data.name,
    status: "Active",
  });

  const created = await TicketCategoryModel.findById(ticketCategory._id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!created) throw new Error("Failed to create ticket category");

  return toTicketCategory(created as unknown as Record<string, unknown>);
}

export async function updateTicketCategory(id: string, data: UpdateTicketCategoryInput): Promise<TicketCategory> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  updateData.updated_at = new Date();

  const ticketCategory = await TicketCategoryModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!ticketCategory) throw new Error("Ticket category not found");

  return toTicketCategory(ticketCategory as unknown as Record<string, unknown>);
}

export async function deleteTicketCategory(id: string, reason?: string): Promise<void> {
  await connectDB();

  await TicketCategoryModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreTicketCategory(id: string): Promise<void> {
  await connectDB();

  await TicketCategoryModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
