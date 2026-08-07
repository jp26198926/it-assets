import { connectDB } from "@/lib/db/connection";
import { ReceivingItem as ReceivingItemModel } from "@/lib/db/models/receiving-item";
import type { CreateReceivingItemInput, UpdateReceivingItemInput, ReceivingItem } from "@/lib/types/receiving-item";

async function generateReceivingItemCode(): Promise<string> {
  const lastItem = await ReceivingItemModel.findOne({ code: { $regex: "^RI\\d{5}$" } })
    .sort({ code: -1 })
    .lean();

  let nextNumber = 1;
  if (lastItem) {
    const lastCode = (lastItem as unknown as { code: string }).code;
    if (lastCode) {
      const num = parseInt(lastCode.substring(2), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
  }

  return `RI${String(nextNumber).padStart(5, "0")}`;
}

function toReceivingItem(d: Record<string, unknown>): ReceivingItem {
  const itemId = d.item_id as unknown as
    | { _id: { toString(): string }; name: string; item_code: string; uom_id?: { name: string } }
    | string;

  let item_id: string = "";
  let item_name: string | undefined;
  let item_code: string | undefined;
  let item_uom_name: string | undefined;
  if (itemId && typeof itemId === "object" && "_id" in itemId) {
    item_id = itemId._id.toString();
    item_name = itemId.name;
    item_code = itemId.item_code;
    if (itemId.uom_id && typeof itemId.uom_id === "object" && "name" in itemId.uom_id) {
      item_uom_name = itemId.uom_id.name;
    }
  } else if (typeof itemId === "string") {
    item_id = itemId;
  }

  const locId = d.storage_location_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string
    | null;

  let storage_location_id: string | null = null;
  let storage_location_name: string | undefined;
  if (locId && typeof locId === "object" && "_id" in locId) {
    storage_location_id = locId._id.toString();
    storage_location_name = locId.name;
  } else if (typeof locId === "string") {
    storage_location_id = locId;
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
    code: d.code as string,
    receiving_id: (d.receiving_id as { toString(): string }).toString(),
    item_id,
    item_name,
    item_code,
    item_uom_name,
    qty: (d.qty as number) ?? 0,
    unit_price: (d.unit_price as number) ?? 0,
    total_cost: (d.total_cost as number) ?? 0,
    expiration_date: (d.expiration_date as Date) ?? null,
    remarks: (d.remarks as string) ?? null,
    storage_location_id,
    storage_location_name,
    status: d.status as "Active" | "Completed" | "Cancelled",
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

function applyPopulates(query: ReturnType<typeof ReceivingItemModel.find>) {
  return query
    .populate({
      path: "item_id",
      select: "name item_code",
      populate: { path: "uom_id", select: "name" },
    })
    .populate("storage_location_id", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getReceivingItems(receivingId: string): Promise<ReceivingItem[]> {
  await connectDB();

  const items = await applyPopulates(
    ReceivingItemModel.find({ receiving_id: receivingId })
      .sort({ created_at: 1 })
      .lean()
  );

  return items.map((d) => toReceivingItem(d as unknown as Record<string, unknown>));
}

export async function getReceivingItemById(id: string): Promise<ReceivingItem | null> {
  await connectDB();

  const item = await applyPopulates(ReceivingItemModel.findById(id).lean());

  if (!item) return null;

  return toReceivingItem(item as unknown as Record<string, unknown>);
}

export async function createReceivingItem(data: CreateReceivingItemInput): Promise<ReceivingItem> {
  await connectDB();

  const code = await generateReceivingItemCode();
  const total_cost = data.qty * data.unit_price;

  const item = await ReceivingItemModel.create({
    code,
    receiving_id: data.receiving_id,
    item_id: data.item_id,
    qty: data.qty,
    unit_price: data.unit_price,
    total_cost,
    expiration_date: data.expiration_date || null,
    remarks: data.remarks || null,
    storage_location_id: data.storage_location_id || null,
    status: "Active",
  });

  const created = await applyPopulates(ReceivingItemModel.findById(item._id).lean());

  if (!created) throw new Error("Failed to create receiving item");

  return toReceivingItem(created as unknown as Record<string, unknown>);
}

export async function updateReceivingItem(id: string, data: UpdateReceivingItemInput): Promise<ReceivingItem> {
  await connectDB();

  const existing = await ReceivingItemModel.findById(id);
  if (!existing) throw new Error("Receiving item not found");
  if (existing.status !== "Active") throw new Error("Can only edit Active receiving items");

  const updateData: Record<string, unknown> = {};
  if (data.item_id !== undefined) updateData.item_id = data.item_id;
  if (data.qty !== undefined) updateData.qty = data.qty;
  if (data.unit_price !== undefined) updateData.unit_price = data.unit_price;
  if (data.expiration_date !== undefined) updateData.expiration_date = data.expiration_date || null;
  if (data.remarks !== undefined) updateData.remarks = data.remarks || null;
  if (data.storage_location_id !== undefined) updateData.storage_location_id = data.storage_location_id || null;

  // Recalculate total_cost
  const qty = data.qty !== undefined ? data.qty : existing.qty;
  const unitPrice = data.unit_price !== undefined ? data.unit_price : existing.unit_price;
  updateData.total_cost = qty * unitPrice;

  updateData.updated_at = new Date();

  const item = await applyPopulates(
    ReceivingItemModel.findByIdAndUpdate(id, updateData, { new: true }).lean()
  );

  if (!item) throw new Error("Receiving item not found");

  return toReceivingItem(item as unknown as Record<string, unknown>);
}

export async function deleteReceivingItem(id: string, reason?: string): Promise<void> {
  await connectDB();

  const existing = await ReceivingItemModel.findById(id);
  if (!existing) throw new Error("Receiving item not found");
  if (existing.status !== "Active") throw new Error("Can only delete Active receiving items");

  await ReceivingItemModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Cancelled",
    updated_at: new Date(),
  });
}
