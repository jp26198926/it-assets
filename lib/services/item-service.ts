import { connectDB } from "@/lib/db/connection";
import { Item as ItemModel } from "@/lib/db/models/item";
import { Category as CategoryModel } from "@/lib/db/models/category";
import { UOM as UOMModel } from "@/lib/db/models/uom";
import type { CreateItemInput, UpdateItemInput, ItemFilters, Item } from "@/lib/types/item";

async function generateItemCode(): Promise<string> {
  const lastItem = await ItemModel.findOne({ item_code: { $regex: "^P\\d{6}$" } })
    .sort({ item_code: -1 })
    .lean();

  let nextNumber = 1;
  if (lastItem) {
    const lastCode = (lastItem as unknown as { item_code: string }).item_code;
    if (lastCode) {
      const num = parseInt(lastCode.substring(1), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
  }

  return `P${String(nextNumber).padStart(6, "0")}`;
}

function toItem(d: Record<string, unknown>): Item {
  const catId = d.category_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string
    | null;

  let category_id: string | null = null;
  let category_name: string | undefined;
  if (catId && typeof catId === "object" && "_id" in catId) {
    category_id = catId._id.toString();
    category_name = catId.name;
  } else if (typeof catId === "string") {
    category_id = catId;
  }

  const uomVal = d.uom_id as unknown as
    | { _id: { toString(): string }; name: string; code: string }
    | string
    | null;

  let uom_id: string | null = null;
  let uom_name: string | undefined;
  let uom_code: string | undefined;
  if (uomVal && typeof uomVal === "object" && "_id" in uomVal) {
    uom_id = uomVal._id.toString();
    uom_name = uomVal.name;
    uom_code = uomVal.code;
  } else if (typeof uomVal === "string") {
    uom_id = uomVal;
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
    name: d.name as string,
    item_code: (d.item_code as string) ?? null,
    category_id,
    category_name,
    brand: (d.brand as string) ?? null,
    model: (d.model as string) ?? null,
    description: (d.description as string) ?? null,
    uom_id,
    uom_name,
    uom_code,
    minimum_stock: (d.minimum_stock as number) ?? 0,
    image_url: (d.image_url as string) ?? null,
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

export async function getItemSelectOptions(): Promise<{
  categories: { id: string; name: string }[];
  uoms: { id: string; name: string; code: string }[];
}> {
  await connectDB();

  const categories = await CategoryModel.find({ deleted_at: null }).select("name").sort({ name: 1 }).lean();
  const uoms = await UOMModel.find({ deleted_at: null }).select("name code").sort({ name: 1 }).lean();

  return {
    categories: categories.map((c) => ({
      id: (c._id as { toString(): string }).toString(),
      name: c.name,
    })),
    uoms: uoms.map((u) => ({
      id: (u._id as { toString(): string }).toString(),
      name: u.name,
      code: u.code,
    })),
  };
}

export async function getItems(filters?: ItemFilters): Promise<Item[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { item_code: { $regex: filters.search, $options: "i" } },
      { brand: { $regex: filters.search, $options: "i" } },
      { model: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.item_code) {
    query.item_code = { $regex: filters.item_code, $options: "i" };
  }

  if (filters?.category_id) {
    query.category_id = filters.category_id;
  }

  if (filters?.brand) {
    query.brand = { $regex: filters.brand, $options: "i" };
  }

  if (filters?.model) {
    query.model = { $regex: filters.model, $options: "i" };
  }

  if (filters?.uom_id) {
    query.uom_id = filters.uom_id;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const items = await ItemModel.find(query)
    .populate("category_id", "name")
    .populate("uom_id", "name code")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .sort({ created_at: -1 })
    .lean();

  return items.map((d) => toItem(d as unknown as Record<string, unknown>));
}

export async function getItemById(id: string): Promise<Item | null> {
  await connectDB();

  const item = await ItemModel.findById(id)
    .populate("category_id", "name")
    .populate("uom_id", "name code")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!item) return null;

  return toItem(item as unknown as Record<string, unknown>);
}

export async function createItem(data: CreateItemInput): Promise<Item> {
  await connectDB();

  const item_code = await generateItemCode();

  const item = await ItemModel.create({
    name: data.name,
    item_code,
    category_id: data.category_id || null,
    brand: data.brand || null,
    model: data.model || null,
    description: data.description || null,
    uom_id: data.uom_id || null,
    minimum_stock: data.minimum_stock ?? 0,
    image_url: data.image_url || null,
    status: "Active",
    created_by: data.created_by || null,
  });

  const created = await ItemModel.findById(item._id)
    .populate("category_id", "name")
    .populate("uom_id", "name code")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!created) throw new Error("Failed to create item");

  return toItem(created as unknown as Record<string, unknown>);
}

export async function updateItem(id: string, data: UpdateItemInput): Promise<Item> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category_id !== undefined) updateData.category_id = data.category_id || null;
  if (data.brand !== undefined) updateData.brand = data.brand || null;
  if (data.model !== undefined) updateData.model = data.model || null;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.uom_id !== undefined) updateData.uom_id = data.uom_id || null;
  if (data.minimum_stock !== undefined) updateData.minimum_stock = data.minimum_stock;
  if (data.image_url !== undefined) updateData.image_url = data.image_url || null;
  if (data.updated_by !== undefined) updateData.updated_by = data.updated_by || null;
  updateData.updated_at = new Date();

  const item = await ItemModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("category_id", "name")
    .populate("uom_id", "name code")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!item) throw new Error("Item not found");

  return toItem(item as unknown as Record<string, unknown>);
}

export async function deleteItem(id: string, reason?: string): Promise<void> {
  await connectDB();

  await ItemModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreItem(id: string): Promise<void> {
  await connectDB();

  await ItemModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
