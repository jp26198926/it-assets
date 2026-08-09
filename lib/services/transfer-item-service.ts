import { connectDB } from "@/lib/db/connection";
import { TransferItem as TransferItemModel } from "@/lib/db/models/transfer-item";
import { Item as ItemModel } from "@/lib/db/models/item";
import type { CreateTransferItemInput, UpdateTransferItemInput, TransferItem } from "@/lib/types/transfer-item";

async function generateTransferItemCode(): Promise<string> {
  const lastItem = await TransferItemModel.findOne({ code: { $regex: "^TI\\d{5}$" } })
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

  return `TI${String(nextNumber).padStart(5, "0")}`;
}

function toTransferItem(d: Record<string, unknown>): TransferItem {
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
    transfer_id: (d.transfer_id as { toString(): string }).toString(),
    item_id,
    item_name,
    item_code,
    item_uom_name,
    qty: (d.qty as number) ?? 0,
    remarks: (d.remarks as string) ?? null,
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

function applyPopulates(query: ReturnType<typeof TransferItemModel.find>) {
  return query
    .populate({
      path: "item_id",
      select: "name item_code",
      populate: { path: "uom_id", select: "name" },
    })
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getTransferItems(transferId: string): Promise<TransferItem[]> {
  await connectDB();

  const items = await applyPopulates(
    TransferItemModel.find({ transfer_id: transferId })
      .sort({ created_at: 1 })
      .lean()
  );

  return items.map((d) => toTransferItem(d as unknown as Record<string, unknown>));
}

export async function getTransferItemById(id: string): Promise<TransferItem | null> {
  await connectDB();

  const item = await applyPopulates(TransferItemModel.findById(id).lean());

  if (!item) return null;

  return toTransferItem(item as unknown as Record<string, unknown>);
}

export async function createTransferItem(data: CreateTransferItemInput): Promise<TransferItem> {
  await connectDB();

  const code = await generateTransferItemCode();

  const item = await TransferItemModel.create({
    code,
    transfer_id: data.transfer_id,
    item_id: data.item_id,
    qty: data.qty,
    remarks: data.remarks || null,
    status: "Active",
  });

  const created = await applyPopulates(TransferItemModel.findById(item._id).lean());

  if (!created) throw new Error("Failed to create transfer item");

  return toTransferItem(created as unknown as Record<string, unknown>);
}

export async function updateTransferItem(id: string, data: UpdateTransferItemInput): Promise<TransferItem> {
  await connectDB();

  const existing = await TransferItemModel.findById(id);
  if (!existing) throw new Error("Transfer item not found");
  if (existing.status !== "Active") throw new Error("Can only edit Active transfer items");

  const updateData: Record<string, unknown> = {};
  if (data.item_id !== undefined) updateData.item_id = data.item_id;
  if (data.qty !== undefined) updateData.qty = data.qty;
  if (data.remarks !== undefined) updateData.remarks = data.remarks || null;
  updateData.updated_at = new Date();

  const item = await applyPopulates(
    TransferItemModel.findByIdAndUpdate(id, updateData, { new: true }).lean()
  );

  if (!item) throw new Error("Transfer item not found");

  return toTransferItem(item as unknown as Record<string, unknown>);
}

export async function deleteTransferItem(id: string, reason?: string): Promise<void> {
  await connectDB();

  const existing = await TransferItemModel.findById(id);
  if (!existing) throw new Error("Transfer item not found");
  if (existing.status !== "Active") throw new Error("Can only delete Active transfer items");

  await TransferItemModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Cancelled",
    updated_at: new Date(),
  });
}
