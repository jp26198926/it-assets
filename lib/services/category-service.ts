import { connectDB } from "@/lib/db/connection";
import { Category as CategoryModel } from "@/lib/db/models/category";
import type { CreateCategoryInput, UpdateCategoryInput, CategoryFilters, Category } from "@/lib/types/category";

function toCategory(d: Record<string, unknown>): Category {
  return {
    id: (d._id as { toString(): string }).toString(),
    name: d.name as string,
    type: d.type as "Inventoriable" | "Consumable",
    description: (d.description as string) ?? null,
    status: d.status as "Active" | "Deleted",
    created_at: d.created_at as Date,
    created_by: d.created_by ? (d.created_by as { toString(): string }).toString() : null,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by: d.updated_by ? (d.updated_by as { toString(): string }).toString() : null,
    deleted_at: (d.deleted_at as Date) ?? null,
  };
}

export async function getCategories(filters?: CategoryFilters): Promise<Category[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.type) {
    query.type = filters.type;
  }

  if (filters?.description) {
    query.description = { $regex: filters.description, $options: "i" };
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const categories = await CategoryModel.find(query)
    .sort({ created_at: -1 })
    .lean();

  return categories.map((d) => toCategory(d as unknown as Record<string, unknown>));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  await connectDB();

  const category = await CategoryModel.findById(id).lean();

  if (!category) return null;

  return toCategory(category as unknown as Record<string, unknown>);
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  await connectDB();

  const category = await CategoryModel.create({
    name: data.name,
    type: data.type,
    description: data.description || null,
    status: "Active",
  });

  const created = await CategoryModel.findById(category._id).lean();

  if (!created) throw new Error("Failed to create category");

  return toCategory(created as unknown as Record<string, unknown>);
}

export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.description !== undefined) updateData.description = data.description || null;
  updateData.updated_at = new Date();

  const category = await CategoryModel.findByIdAndUpdate(id, updateData, { new: true })
    .lean();

  if (!category) throw new Error("Category not found");

  return toCategory(category as unknown as Record<string, unknown>);
}

export async function deleteCategory(id: string, reason?: string): Promise<void> {
  await connectDB();

  await CategoryModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreCategory(id: string): Promise<void> {
  await connectDB();

  await CategoryModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
