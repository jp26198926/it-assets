import { connectDB, startSession } from "@/lib/db/connection";
import { Adjustment as AdjustmentModel } from "@/lib/db/models/adjustment";
import { Item as ItemModel } from "@/lib/db/models/item";
import { StockLevel as StockLevelModel } from "@/lib/db/models/stock-level";
import { StockMovement as StockMovementModel } from "@/lib/db/models/stock-movement";
import type { CreateAdjustmentInput, AdjustmentFilters, Adjustment } from "@/lib/types/adjustment";

async function generateAdjustmentCode(): Promise<string> {
  const last = await AdjustmentModel.findOne({ code: { $regex: "^ADJ\\d{5}$" } })
    .sort({ code: -1 })
    .lean();

  let nextNumber = 1;
  if (last) {
    const lastCode = (last as unknown as { code: string }).code;
    if (lastCode) {
      const num = parseInt(lastCode.substring(3), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
  }

  return `ADJ${String(nextNumber).padStart(5, "0")}`;
}

function toAdjustment(d: Record<string, unknown>): Adjustment {
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
    date_adjusted: d.date_adjusted as Date,
    location_id,
    location_name,
    item_id,
    item_name,
    item_code,
    qty: (d.qty as number) ?? 0,
    remarks: (d.remarks as string) ?? null,
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

function applyPopulates(query: ReturnType<typeof AdjustmentModel.find>) {
  return query
    .populate("location_id", "name")
    .populate("item_id", "name item_code")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getAdjustments(filters?: AdjustmentFilters): Promise<Adjustment[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { code: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.code) {
    query.code = { $regex: filters.code, $options: "i" };
  }

  if (filters?.location_id) {
    query.location_id = filters.location_id;
  }

  if (filters?.item_id) {
    query.item_id = filters.item_id;
  }

  if (filters?.date_from) {
    query.date_adjusted = { $gte: new Date(filters.date_from) };
  }

  if (filters?.date_to) {
    const endDate = new Date(filters.date_to);
    endDate.setHours(23, 59, 59, 999);
    query.date_adjusted = { ...(query.date_adjusted as Record<string, unknown>), $lte: endDate };
  }

  const adjustments = await applyPopulates(
    AdjustmentModel.find(query).sort({ created_at: -1 }).lean()
  );

  return adjustments.map((d) => toAdjustment(d as unknown as Record<string, unknown>));
}

export async function getAdjustmentById(id: string): Promise<Adjustment | null> {
  await connectDB();

  const adjustment = await applyPopulates(AdjustmentModel.findById(id).lean());

  if (!adjustment) return null;

  return toAdjustment(adjustment as unknown as Record<string, unknown>);
}

export async function getStockLevelForItemAndLocation(
  itemId: string,
  locationId: string
): Promise<{ qty: number } | null> {
  await connectDB();

  const level = await StockLevelModel.findOne({
    item_id: itemId,
    location_id: locationId,
  }).lean();

  if (!level) return null;

  return { qty: (level as unknown as { qty: number }).qty };
}

export async function createAdjustment(data: CreateAdjustmentInput): Promise<Adjustment> {
  const session = await startSession();
  session.startTransaction();

  try {
    const code = await generateAdjustmentCode();

    const adjustment = await AdjustmentModel.create([{
      code,
      date_adjusted: data.date_adjusted,
      location_id: data.location_id,
      item_id: data.item_id,
      qty: data.qty,
      remarks: data.remarks || null,
    }], { session });

    const existingLevel = await StockLevelModel.findOne({
      item_id: data.item_id,
      location_id: data.location_id,
    }).session(session);

    if (existingLevel) {
      await StockLevelModel.findByIdAndUpdate(existingLevel._id, {
        $inc: { qty: data.qty },
      }).session(session);
    } else {
      await StockLevelModel.create([{
        item_id: data.item_id,
        location_id: data.location_id,
        qty: data.qty,
      }], { session });
    }

    await ItemModel.findByIdAndUpdate(data.item_id, {
      $inc: { stock: data.qty },
    }).session(session);

    await StockMovementModel.create([{
      date: new Date(),
      transaction_type: "ADJUSTMENT",
      item_id: data.item_id,
      location_id: data.location_id,
      qty: data.qty,
      reference_trans_id: adjustment[0]._id,
      reference_item_id: adjustment[0]._id,
      reference_description: code,
    }], { session });

    await session.commitTransaction();

    const created = await applyPopulates(
      AdjustmentModel.findById(adjustment[0]._id).lean()
    );

    if (!created) throw new Error("Failed to create adjustment");

    return toAdjustment(created as unknown as Record<string, unknown>);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function deleteAdjustment(id: string, reason?: string): Promise<void> {
  await connectDB();

  await AdjustmentModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    updated_at: new Date(),
  });
}
