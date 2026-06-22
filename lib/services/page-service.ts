import { connectDB } from "@/lib/db/connection";
import { Page as PageModel } from "@/lib/db/models/page";
import { invalidateCache } from "@/lib/services/authorization-service";
import type { CreatePageInput, UpdatePageInput, PageFilters, Page } from "@/lib/types/page";

function toPage(p: Record<string, unknown>): Page {
  const parentId = p.parent_id as unknown as { _id: { toString(): string }; name: string } | null;

  const createdByVal = p.created_by as unknown as
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

  const updatedByVal = p.updated_by as unknown as
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

  const deletedByVal = p.deleted_by as unknown as
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
    id: (p._id as { toString(): string }).toString(),
    name: p.name as string,
    description: (p.description as string) ?? null,
    path: p.path as string,
    icon: p.icon as string,
    parent_id: parentId?._id.toString() ?? null,
    parent_name: parentId?.name,
    section: (p.section as string) ?? null,
    order: (p.order as number) ?? 0,
    status: p.status as "Active" | "Deleted",
    created_at: p.created_at as Date,
    created_by,
    created_by_name,
    updated_at: (p.updated_at as Date) ?? null,
    updated_by,
    updated_by_name,
    deleted_at: (p.deleted_at as Date) ?? null,
    deleted_by,
    deleted_by_name,
    deleted_reason: (p.deleted_reason as string) ?? null,
  };
}

export async function getSidebarPages(): Promise<Page[]> {
  await connectDB();

  const pages = await PageModel.find({ status: "Active", deleted_at: null })
    .populate("parent_id", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .sort({ order: 1, created_at: 1 })
    .lean();

  return pages.map((p) => toPage(p as unknown as Record<string, unknown>));
}

export async function getPages(filters?: PageFilters): Promise<Page[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { path: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { section: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.path) {
    query.path = { $regex: filters.path, $options: "i" };
  }

  if (filters?.description) {
    query.description = { $regex: filters.description, $options: "i" };
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.section) {
    query.section = { $regex: filters.section, $options: "i" };
  }

  if (filters?.parent_id) {
    query.parent_id = filters.parent_id;
  }

  const pages = await PageModel.find(query)
    .populate("parent_id", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .sort({ created_at: -1 })
    .lean();

  return pages.map((p) => toPage(p as unknown as Record<string, unknown>));
}

export async function getPageById(id: string): Promise<Page | null> {
  await connectDB();

  const page = await PageModel.findById(id)
    .populate("parent_id", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!page) return null;

  return toPage(page as unknown as Record<string, unknown>);
}

export async function createPage(data: CreatePageInput): Promise<Page> {
  await connectDB();

  const page = await PageModel.create({
    name: data.name,
    description: data.description || null,
    path: data.path,
    icon: data.icon,
    parent_id: data.parent_id || null,
    section: data.section || null,
    order: data.order ?? 0,
    status: "Active",
  });

  const populated = await PageModel.findById(page._id)
    .populate("parent_id", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!populated) throw new Error("Failed to create page");

  invalidateCache();
  return toPage(populated as unknown as Record<string, unknown>);
}

export async function updatePage(id: string, data: UpdatePageInput): Promise<Page> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.path !== undefined) updateData.path = data.path;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.parent_id !== undefined) updateData.parent_id = data.parent_id || null;
  if (data.section !== undefined) updateData.section = data.section || null;
  if (data.order !== undefined) updateData.order = data.order;
  updateData.updated_at = new Date();

  const page = await PageModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("parent_id", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!page) throw new Error("Page not found");

  invalidateCache();
  return toPage(page as unknown as Record<string, unknown>);
}

export async function deletePage(id: string, reason?: string): Promise<void> {
  await connectDB();

  await PageModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });

  invalidateCache();
}

export async function restorePage(id: string): Promise<void> {
  await connectDB();

  await PageModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });

  invalidateCache();
}
