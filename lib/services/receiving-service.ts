import { connectDB, startSession } from "@/lib/db/connection";
import { Receiving as ReceivingModel } from "@/lib/db/models/receiving";
import { ReceivingItem as ReceivingItemModel } from "@/lib/db/models/receiving-item";
import { Item as ItemModel } from "@/lib/db/models/item";
import { StockLevel as StockLevelModel } from "@/lib/db/models/stock-level";
import { StockMovement as StockMovementModel } from "@/lib/db/models/stock-movement";
import type { CreateReceivingInput, UpdateReceivingInput, ReceivingFilters, Receiving } from "@/lib/types/receiving";

async function generateReceivingCode(): Promise<string> {
  const lastReceiving = await ReceivingModel.findOne({ code: { $regex: "^RCV\\d{5}$" } })
    .sort({ code: -1 })
    .lean();

  let nextNumber = 1;
  if (lastReceiving) {
    const lastCode = (lastReceiving as unknown as { code: string }).code;
    if (lastCode) {
      const num = parseInt(lastCode.substring(3), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
  }

  return `RCV${String(nextNumber).padStart(5, "0")}`;
}

function toReceiving(d: Record<string, unknown>): Receiving {
  const supplierVal = d.supplier_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string
    | null;

  let supplier_id: string | null = null;
  let supplier_name: string | undefined;
  if (supplierVal && typeof supplierVal === "object" && "_id" in supplierVal) {
    supplier_id = supplierVal._id.toString();
    supplier_name = supplierVal.name;
  } else if (typeof supplierVal === "string") {
    supplier_id = supplierVal;
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
    date_received: d.date_received as Date,
    supplier_id,
    supplier_name,
    po_number: (d.po_number as string) ?? null,
    invoice_number: (d.invoice_number as string) ?? null,
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

const populateFields = [
  "populate",
  { path: "supplier_id", select: "name" },
  "populate",
  "created_by",
  "first_name last_name",
  "populate",
  "updated_by",
  "first_name last_name",
  "populate",
  "deleted_by",
  "first_name last_name",
] as const;

function applyPopulates(query: ReturnType<typeof ReceivingModel.find>) {
  return query
    .populate("supplier_id", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getReceivings(filters?: ReceivingFilters): Promise<Receiving[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { code: { $regex: filters.search, $options: "i" } },
      { po_number: { $regex: filters.search, $options: "i" } },
      { invoice_number: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.code) {
    query.code = { $regex: filters.code, $options: "i" };
  }

  if (filters?.supplier_id) {
    query.supplier_id = filters.supplier_id;
  }

  if (filters?.po_number) {
    query.po_number = { $regex: filters.po_number, $options: "i" };
  }

  if (filters?.invoice_number) {
    query.invoice_number = { $regex: filters.invoice_number, $options: "i" };
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.date_from) {
    query.date_received = { ...query.date_received as Record<string, unknown>, $gte: new Date(filters.date_from) };
  }

  if (filters?.date_to) {
    const endDate = new Date(filters.date_to);
    endDate.setHours(23, 59, 59, 999);
    query.date_received = { ...query.date_received as Record<string, unknown>, $lte: endDate };
  }

  const receivings = await applyPopulates(
    ReceivingModel.find(query).sort({ created_at: -1 }).lean()
  );

  return receivings.map((d) => toReceiving(d as unknown as Record<string, unknown>));
}

export async function getReceivingById(id: string): Promise<Receiving | null> {
  await connectDB();

  const receiving = await applyPopulates(ReceivingModel.findById(id).lean());

  if (!receiving) return null;

  return toReceiving(receiving as unknown as Record<string, unknown>);
}

export async function createReceiving(data: CreateReceivingInput): Promise<Receiving> {
  await connectDB();

  const code = await generateReceivingCode();

  const receiving = await ReceivingModel.create({
    code,
    date_received: data.date_received,
    supplier_id: data.supplier_id || null,
    po_number: data.po_number || null,
    invoice_number: data.invoice_number || null,
    remarks: data.remarks || null,
    status: "Active",
  });

  const created = await applyPopulates(ReceivingModel.findById(receiving._id).lean());

  if (!created) throw new Error("Failed to create receiving");

  return toReceiving(created as unknown as Record<string, unknown>);
}

export async function updateReceiving(id: string, data: UpdateReceivingInput): Promise<Receiving> {
  await connectDB();

  const existing = await ReceivingModel.findById(id);
  if (!existing) throw new Error("Receiving not found");
  if (existing.status !== "Active") throw new Error("Can only edit Active receivings");

  const updateData: Record<string, unknown> = {};
  if (data.date_received !== undefined) updateData.date_received = data.date_received;
  if (data.supplier_id !== undefined) updateData.supplier_id = data.supplier_id || null;
  if (data.po_number !== undefined) updateData.po_number = data.po_number || null;
  if (data.invoice_number !== undefined) updateData.invoice_number = data.invoice_number || null;
  if (data.remarks !== undefined) updateData.remarks = data.remarks || null;
  updateData.updated_at = new Date();

  const receiving = await applyPopulates(
    ReceivingModel.findByIdAndUpdate(id, updateData, { new: true }).lean()
  );

  if (!receiving) throw new Error("Receiving not found");

  return toReceiving(receiving as unknown as Record<string, unknown>);
}

export async function cancelReceiving(id: string): Promise<void> {
  await connectDB();

  const existing = await ReceivingModel.findById(id);
  if (!existing) throw new Error("Receiving not found");
  if (existing.status !== "Active") throw new Error("Can only cancel Active receivings");

  await ReceivingModel.findByIdAndUpdate(id, {
    status: "Cancelled",
    updated_at: new Date(),
  });

  await ReceivingItemModel.updateMany(
    { receiving_id: id, status: "Active" },
    { status: "Cancelled", updated_at: new Date() }
  );
}

export async function completeReceiving(id: string): Promise<void> {
  const session = await startSession();
  session.startTransaction();

  try {
    const receiving = await ReceivingModel.findById(id).session(session);
    if (!receiving) throw new Error("Receiving not found");
    if (receiving.status !== "Active") throw new Error("Can only complete Active receivings");

    const items = await ReceivingItemModel.find({
      receiving_id: id,
      status: "Active",
    }).session(session);

    if (items.length === 0) throw new Error("No active receiving items to process");

    for (const item of items) {
      // a. Update item stock
      await ItemModel.findByIdAndUpdate(item.item_id, {
        $inc: { stock: item.qty },
      }).session(session);

      // b. Update or create StockLevel
      if (item.storage_location_id) {
        const existingLevel = await StockLevelModel.findOne({
          item_id: item.item_id,
          location_id: item.storage_location_id,
        }).session(session);

        if (existingLevel) {
          await StockLevelModel.findByIdAndUpdate(existingLevel._id, {
            $inc: { qty: item.qty },
          }).session(session);
        } else {
          await StockLevelModel.create(
            [{
              item_id: item.item_id,
              location_id: item.storage_location_id,
              qty: item.qty,
            }],
            { session }
          );
        }

        // c. Create StockMovement record
        await StockMovementModel.create(
          [{
            date: new Date(),
            transaction_type: "RECEIVE",
            item_id: item.item_id,
            location_id: item.storage_location_id,
            qty: item.qty,
            reference_trans_id: receiving._id,
            reference_item_id: item._id,
            reference_description: `${receiving.code} ${item.code}`,
          }],
          { session }
        );
      }

      // d. Update receiving item status
      await ReceivingItemModel.findByIdAndUpdate(item._id, {
        status: "Completed",
        updated_at: new Date(),
      }).session(session);
    }

    // e. Update receiving status
    await ReceivingModel.findByIdAndUpdate(id, {
      status: "Completed",
      updated_at: new Date(),
    }).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function deleteReceiving(id: string, reason?: string): Promise<void> {
  await connectDB();

  await ReceivingModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Cancelled",
    updated_at: new Date(),
  });
}
