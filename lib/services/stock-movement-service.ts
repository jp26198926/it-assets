import { connectDB } from "@/lib/db/connection";
import { StockMovement as StockMovementModel } from "@/lib/db/models/stock-movement";
import type { CreateStockMovementInput, StockMovement } from "@/lib/types/stock-movement";

function toStockMovement(d: Record<string, unknown>): StockMovement {
  const itemId = d.item_id as unknown as
    | { _id: { toString(): string }; name: string; item_code: string }
    | string;

  let item_id: string = "";
  let item_name: string | undefined;
  let item_code: string | undefined;
  if (itemId && typeof itemId === "object" && "_id" in itemId) {
    item_id = itemId._id.toString();
    item_name = itemId.name;
    item_code = itemId.item_code;
  } else if (typeof itemId === "string") {
    item_id = itemId;
  }

  const locId = d.location_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string;

  let location_id: string = "";
  let location_name: string | undefined;
  if (locId && typeof locId === "object" && "_id" in locId) {
    location_id = locId._id.toString();
    location_name = locId.name;
  } else if (typeof locId === "string") {
    location_id = locId;
  }

  return {
    id: (d._id as { toString(): string }).toString(),
    date: d.date as Date,
    transaction_type: d.transaction_type as "RECEIVE" | "RELEASE",
    item_id,
    item_name,
    item_code,
    location_id,
    location_name,
    qty: (d.qty as number) ?? 0,
    reference_trans_id: (d.reference_trans_id as { toString(): string }).toString(),
    reference_item_id: (d.reference_item_id as { toString(): string }).toString(),
    reference_description: (d.reference_description as string) ?? null,
    remarks: (d.remarks as string) ?? null,
  };
}

export async function getStockMovements(filters?: {
  item_id?: string;
  location_id?: string;
  transaction_type?: string;
}): Promise<StockMovement[]> {
  await connectDB();

  const query: Record<string, unknown> = {};
  if (filters?.item_id) query.item_id = filters.item_id;
  if (filters?.location_id) query.location_id = filters.location_id;
  if (filters?.transaction_type) query.transaction_type = filters.transaction_type;

  const movements = await StockMovementModel.find(query)
    .populate("item_id", "name item_code")
    .populate("location_id", "name")
    .sort({ date: -1 })
    .lean();

  return movements.map((d) => toStockMovement(d as unknown as Record<string, unknown>));
}

export async function createStockMovement(data: CreateStockMovementInput): Promise<StockMovement> {
  await connectDB();

  const movement = await StockMovementModel.create({
    date: data.date,
    transaction_type: data.transaction_type,
    item_id: data.item_id,
    location_id: data.location_id,
    qty: data.qty,
    reference_trans_id: data.reference_trans_id,
    reference_item_id: data.reference_item_id,
    reference_description: data.reference_description || null,
    remarks: data.remarks || null,
  });

  const created = await StockMovementModel.findById(movement._id)
    .populate("item_id", "name item_code")
    .populate("location_id", "name")
    .lean();

  if (!created) throw new Error("Failed to create stock movement");

  return toStockMovement(created as unknown as Record<string, unknown>);
}
