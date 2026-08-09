import { connectDB } from "@/lib/db/connection";
import { StockMovement as StockMovementModel } from "@/lib/db/models/stock-movement";
import type { CreateStockMovementInput, StockMovement, StockMovementFilters } from "@/lib/types/stock-movement";

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
    transaction_type: d.transaction_type as "RECEIVE" | "RELEASE" | "ADJUSTMENT" | "TRANSFER" | "CONVERSION",
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

function hasActiveFilters(filters?: StockMovementFilters): boolean {
  if (!filters) return false;
  return !!(
    filters.date_from ||
    filters.date_to ||
    filters.transaction_type ||
    filters.item_name ||
    filters.location_name ||
    filters.reference_description ||
    filters.remarks
  );
}

export async function getStockMovements(filters?: StockMovementFilters): Promise<StockMovement[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (!hasActiveFilters(filters)) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    query.date = { $gte: startOfDay, $lt: endOfDay };
  } else {
    if (filters!.date_from || filters!.date_to) {
      const dateQuery: Record<string, Date> = {};
      if (filters!.date_from) dateQuery.$gte = new Date(filters!.date_from);
      if (filters!.date_to) {
        const end = new Date(filters!.date_to);
        end.setDate(end.getDate() + 1);
        dateQuery.$lt = end;
      }
      query.date = dateQuery;
    }
  }

  if (filters?.transaction_type) {
    query.transaction_type = filters.transaction_type;
  }

  if (filters?.item_name) {
    const { Item } = await import("@/lib/db/models/item");
    const items = await Item.find({ name: { $regex: filters.item_name, $options: "i" } }).select("_id").lean();
    query.item_id = { $in: items.map((i) => i._id) };
  }

  if (filters?.location_name) {
    const { Location } = await import("@/lib/db/models/location");
    const locations = await Location.find({ name: { $regex: filters.location_name, $options: "i" } }).select("_id").lean();
    query.location_id = { $in: locations.map((l) => l._id) };
  }

  if (filters?.reference_description) {
    query.reference_description = { $regex: filters.reference_description, $options: "i" };
  }

  if (filters?.remarks) {
    query.remarks = { $regex: filters.remarks, $options: "i" };
  }

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
