"use server";

import { connectDB } from "@/lib/db/connection";
import { Page as PageModel } from "@/lib/db/models/page";
import { PageStatus as PageStatusModel } from "@/lib/db/models/page-status";
import type { CreatePageInput, UpdatePageInput, PageFilters, Page, PageStatus as PageStatusType } from "@/lib/types/page";

export async function getPageStatuses(): Promise<PageStatusType[]> {
  await connectDB();
  const statuses = await PageStatusModel.find().lean();
  return statuses.map((s) => ({
    id: s._id.toString(),
    status: s.status,
  }));
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
    const statusDoc = await PageStatusModel.findOne({ status: filters.status }).lean();
    if (statusDoc) {
      query.status_id = statusDoc._id;
    }
  }

  if (filters?.section) {
    query.section = { $regex: filters.section, $options: "i" };
  }

  if (filters?.parent_id) {
    query.parent_id = filters.parent_id;
  }

  const pages = await PageModel.find(query)
    .populate("status_id", "status")
    .populate("parent_id", "name")
    .sort({ created_at: -1 })
    .lean();

  return pages.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    path: p.path,
    icon: p.icon,
    parent_id: p.parent_id ? (p.parent_id as unknown as { _id: { toString(): string } })._id.toString() : null,
    parent_name: p.parent_id ? (p.parent_id as unknown as { name: string }).name : undefined,
    section: p.section,
    status_id: (p.status_id as unknown as { _id: { toString(): string } })._id.toString(),
    status: (p.status_id as unknown as { status: string }).status,
    created_at: p.created_at,
    created_by: p.created_by ? (p.created_by as unknown as { toString(): string }).toString() : null,
    updated_at: p.updated_at,
    updated_by: p.updated_by ? (p.updated_by as unknown as { toString(): string }).toString() : null,
    deleted_at: p.deleted_at,
  }));
}

export async function getPageById(id: string): Promise<Page | null> {
  await connectDB();

  const page = await PageModel.findById(id)
    .populate("status_id", "status")
    .populate("parent_id", "name")
    .lean();

  if (!page) return null;

  return {
    id: page._id.toString(),
    name: page.name,
    description: page.description,
    path: page.path,
    icon: page.icon,
    parent_id: page.parent_id ? (page.parent_id as unknown as { _id: { toString(): string } })._id.toString() : null,
    parent_name: page.parent_id ? (page.parent_id as unknown as { name: string }).name : undefined,
    section: page.section,
    status_id: (page.status_id as unknown as { _id: { toString(): string } })._id.toString(),
    status: (page.status_id as unknown as { status: string }).status,
    created_at: page.created_at,
    created_by: page.created_by ? (page.created_by as unknown as { toString(): string }).toString() : null,
    updated_at: page.updated_at,
    updated_by: page.updated_by ? (page.updated_by as unknown as { toString(): string }).toString() : null,
    deleted_at: page.deleted_at,
  };
}

export async function createPage(data: CreatePageInput): Promise<Page> {
  await connectDB();

  const activeStatus = await PageStatusModel.findOne({ status: "Active" }).lean();
  if (!activeStatus) throw new Error("Active status not found");

  const page = await PageModel.create({
    name: data.name,
    description: data.description || null,
    path: data.path,
    icon: data.icon,
    parent_id: data.parent_id || null,
    section: data.section || null,
    status_id: activeStatus._id,
  });

  const populated = await PageModel.findById(page._id)
    .populate("status_id", "status")
    .populate("parent_id", "name")
    .lean();

  if (!populated) throw new Error("Failed to create page");

  return {
    id: populated._id.toString(),
    name: populated.name,
    description: populated.description,
    path: populated.path,
    icon: populated.icon,
    parent_id: populated.parent_id ? (populated.parent_id as unknown as { _id: { toString(): string } })._id.toString() : null,
    parent_name: populated.parent_id ? (populated.parent_id as unknown as { name: string }).name : undefined,
    section: populated.section,
    status_id: (populated.status_id as unknown as { _id: { toString(): string } })._id.toString(),
    status: (populated.status_id as unknown as { status: string }).status,
    created_at: populated.created_at,
    created_by: populated.created_by ? (populated.created_by as unknown as { toString(): string }).toString() : null,
    updated_at: populated.updated_at,
    updated_by: populated.updated_by ? (populated.updated_by as unknown as { toString(): string }).toString() : null,
    deleted_at: populated.deleted_at,
  };
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
  updateData.updated_at = new Date();

  const page = await PageModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("status_id", "status")
    .populate("parent_id", "name")
    .lean();

  if (!page) throw new Error("Page not found");

  return {
    id: page._id.toString(),
    name: page.name,
    description: page.description,
    path: page.path,
    icon: page.icon,
    parent_id: page.parent_id ? (page.parent_id as unknown as { _id: { toString(): string } })._id.toString() : null,
    parent_name: page.parent_id ? (page.parent_id as unknown as { name: string }).name : undefined,
    section: page.section,
    status_id: (page.status_id as unknown as { _id: { toString(): string } })._id.toString(),
    status: (page.status_id as unknown as { status: string }).status,
    created_at: page.created_at,
    created_by: page.created_by ? (page.created_by as unknown as { toString(): string }).toString() : null,
    updated_at: page.updated_at,
    updated_by: page.updated_by ? (page.updated_by as unknown as { toString(): string }).toString() : null,
    deleted_at: page.deleted_at,
  };
}

export async function deletePage(id: string, reason?: string): Promise<void> {
  await connectDB();

  const deletedStatus = await PageStatusModel.findOne({ status: "Deleted" }).lean();
  await PageModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status_id: deletedStatus?._id,
    updated_at: new Date(),
  });
}

export async function restorePage(id: string): Promise<void> {
  await connectDB();

  const activeStatus = await PageStatusModel.findOne({ status: "Active" }).lean();
  await PageModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status_id: activeStatus?._id,
    updated_at: new Date(),
  });
}
