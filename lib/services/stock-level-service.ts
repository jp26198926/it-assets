import { connectDB } from "@/lib/db/connection";
import { StockLevel as StockLevelModel } from "@/lib/db/models/stock-level";
import type { StockLevel } from "@/lib/types/stock-level";

function toStockLevel(d: Record<string, unknown>): StockLevel {
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
    item_id,
    item_name,
    item_code,
    location_id,
    location_name,
    qty: (d.qty as number) ?? 0,
  };
}

export async function getStockLevels(filters?: { item_id?: string; location_id?: string }): Promise<StockLevel[]> {
  await connectDB();

  const query: Record<string, unknown> = {};
  if (filters?.item_id) query.item_id = filters.item_id;
  if (filters?.location_id) query.location_id = filters.location_id;

  const levels = await StockLevelModel.find(query)
    .populate("item_id", "name item_code")
    .populate("location_id", "name")
    .lean();

  return levels.map((d) => toStockLevel(d as unknown as Record<string, unknown>));
}

export async function getStockLevelByItemAndLocation(
  itemId: string,
  locationId: string
): Promise<StockLevel | null> {
  await connectDB();

  const level = await StockLevelModel.findOne({
    item_id: itemId,
    location_id: locationId,
  }).lean();

  if (!level) return null;

  return toStockLevel(level as unknown as Record<string, unknown>);
}

export async function createOrUpdateStockLevel(
  itemId: string,
  locationId: string,
  qty: number
): Promise<void> {
  await connectDB();

  const existing = await StockLevelModel.findOne({
    item_id: itemId,
    location_id: locationId,
  });

  if (existing) {
    await StockLevelModel.findByIdAndUpdate(existing._id, {
      $inc: { qty },
    });
  } else {
    await StockLevelModel.create({
      item_id: itemId,
      location_id: locationId,
      qty,
    });
  }
}
