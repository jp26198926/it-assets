import { connectDB, startSession } from "@/lib/db/connection";
import { Conversion as ConversionModel } from "@/lib/db/models/conversion";
import { Item as ItemModel } from "@/lib/db/models/item";
import { StockLevel as StockLevelModel } from "@/lib/db/models/stock-level";
import { StockMovement as StockMovementModel } from "@/lib/db/models/stock-movement";
import type { CreateConversionInput, ConversionFilters, Conversion } from "@/lib/types/conversion";

async function generateConversionCode(): Promise<string> {
  const last = await ConversionModel.findOne({ code: { $regex: "^CONV\\d{5}$" } })
    .sort({ code: -1 })
    .lean();

  let nextNumber = 1;
  if (last) {
    const lastCode = (last as unknown as { code: string }).code;
    if (lastCode) {
      const num = parseInt(lastCode.substring(4), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
  }

  return `CONV${String(nextNumber).padStart(5, "0")}`;
}

function toConversion(d: Record<string, unknown>): Conversion {
  const fromItemId = d.from_item_id as unknown as
    | { _id: { toString(): string }; name: string; item_code: string }
    | string;

  let from_item_id: string = "";
  let from_item_name: string | undefined;
  let from_item_code: string | undefined;
  if (fromItemId && typeof fromItemId === "object" && "_id" in fromItemId) {
    from_item_id = fromItemId._id.toString();
    from_item_name = fromItemId.name;
    from_item_code = fromItemId.item_code;
  } else if (typeof fromItemId === "string") {
    from_item_id = fromItemId;
  }

  const toItemId = d.to_item_id as unknown as
    | { _id: { toString(): string }; name: string; item_code: string }
    | string;

  let to_item_id: string = "";
  let to_item_name: string | undefined;
  let to_item_code: string | undefined;
  if (toItemId && typeof toItemId === "object" && "_id" in toItemId) {
    to_item_id = toItemId._id.toString();
    to_item_name = toItemId.name;
    to_item_code = toItemId.item_code;
  } else if (typeof toItemId === "string") {
    to_item_id = toItemId;
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
    date_converted: d.date_converted as Date,
    location_id,
    location_name,
    from_item_id,
    from_item_name,
    from_item_code,
    to_item_id,
    to_item_name,
    to_item_code,
    from_qty: (d.from_qty as number) ?? 0,
    to_qty: (d.to_qty as number) ?? 0,
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

function applyPopulates(query: ReturnType<typeof ConversionModel.find>) {
  return query
    .populate("location_id", "name")
    .populate("from_item_id", "name item_code")
    .populate("to_item_id", "name item_code")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getConversions(filters?: ConversionFilters): Promise<Conversion[]> {
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

  if (filters?.from_item_id) {
    query.from_item_id = filters.from_item_id;
  }

  if (filters?.to_item_id) {
    query.to_item_id = filters.to_item_id;
  }

  if (filters?.date_from) {
    query.date_converted = { $gte: new Date(filters.date_from) };
  }

  if (filters?.date_to) {
    const endDate = new Date(filters.date_to);
    endDate.setHours(23, 59, 59, 999);
    query.date_converted = { ...(query.date_converted as Record<string, unknown>), $lte: endDate };
  }

  const conversions = await applyPopulates(
    ConversionModel.find(query).sort({ created_at: -1 }).lean()
  );

  return conversions.map((d) => toConversion(d as unknown as Record<string, unknown>));
}

export async function getConversionById(id: string): Promise<Conversion | null> {
  await connectDB();

  const conversion = await applyPopulates(ConversionModel.findById(id).lean());

  if (!conversion) return null;

  return toConversion(conversion as unknown as Record<string, unknown>);
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

export async function createConversion(data: CreateConversionInput): Promise<Conversion> {
  const session = await startSession();
  session.startTransaction();

  try {
    const code = await generateConversionCode();

    const conversion = await ConversionModel.create([{
      code,
      date_converted: data.date_converted,
      location_id: data.location_id,
      from_item_id: data.from_item_id,
      to_item_id: data.to_item_id,
      from_qty: data.from_qty,
      to_qty: data.to_qty,
      remarks: data.remarks || null,
    }], { session });

    // Deduct from source item stock level
    const fromLevel = await StockLevelModel.findOne({
      item_id: data.from_item_id,
      location_id: data.location_id,
    }).session(session);

    if (fromLevel) {
      await StockLevelModel.findByIdAndUpdate(fromLevel._id, {
        $inc: { qty: -data.from_qty },
      }).session(session);
    }

    // Add to destination item stock level
    const toLevel = await StockLevelModel.findOne({
      item_id: data.to_item_id,
      location_id: data.location_id,
    }).session(session);

    if (toLevel) {
      await StockLevelModel.findByIdAndUpdate(toLevel._id, {
        $inc: { qty: data.to_qty },
      }).session(session);
    } else {
      await StockLevelModel.create([{
        item_id: data.to_item_id,
        location_id: data.location_id,
        qty: data.to_qty,
      }], { session });
    }

    // Update Item.stock for source item (deduct)
    await ItemModel.findByIdAndUpdate(data.from_item_id, {
      $inc: { stock: -data.from_qty },
    }).session(session);

    // Update Item.stock for destination item (add)
    await ItemModel.findByIdAndUpdate(data.to_item_id, {
      $inc: { stock: data.to_qty },
    }).session(session);

    // Create stock movement for source item (negative)
    await StockMovementModel.create([{
      date: new Date(),
      transaction_type: "CONVERSION",
      item_id: data.from_item_id,
      location_id: data.location_id,
      qty: -data.from_qty,
      reference_trans_id: conversion[0]._id,
      reference_item_id: conversion[0]._id,
      reference_description: code,
    }], { session });

    // Create stock movement for destination item (positive)
    await StockMovementModel.create([{
      date: new Date(),
      transaction_type: "CONVERSION",
      item_id: data.to_item_id,
      location_id: data.location_id,
      qty: data.to_qty,
      reference_trans_id: conversion[0]._id,
      reference_item_id: conversion[0]._id,
      reference_description: code,
    }], { session });

    await session.commitTransaction();

    const created = await applyPopulates(
      ConversionModel.findById(conversion[0]._id).lean()
    );

    if (!created) throw new Error("Failed to create conversion");

    return toConversion(created as unknown as Record<string, unknown>);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
