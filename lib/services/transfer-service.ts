import { connectDB, startSession } from "@/lib/db/connection";
import { Transfer as TransferModel } from "@/lib/db/models/transfer";
import { TransferItem as TransferItemModel } from "@/lib/db/models/transfer-item";
import { StockLevel as StockLevelModel } from "@/lib/db/models/stock-level";
import { StockMovement as StockMovementModel } from "@/lib/db/models/stock-movement";
import type { CreateTransferInput, UpdateTransferInput, TransferFilters, Transfer } from "@/lib/types/transfer";

async function generateTransferCode(): Promise<string> {
  const lastTransfer = await TransferModel.findOne({ code: { $regex: "^TRAN\\d{5}$" } })
    .sort({ code: -1 })
    .lean();

  let nextNumber = 1;
  if (lastTransfer) {
    const lastCode = (lastTransfer as unknown as { code: string }).code;
    if (lastCode) {
      const num = parseInt(lastCode.substring(4), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
  }

  return `TRAN${String(nextNumber).padStart(5, "0")}`;
}

function toTransfer(d: Record<string, unknown>): Transfer {
  const fromLocVal = d.from_location_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string;

  let from_location_id: string = "";
  let from_location_name: string | undefined;
  if (fromLocVal && typeof fromLocVal === "object" && "_id" in fromLocVal) {
    from_location_id = fromLocVal._id.toString();
    from_location_name = fromLocVal.name;
  } else if (typeof fromLocVal === "string") {
    from_location_id = fromLocVal;
  }

  const toLocVal = d.to_location_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string;

  let to_location_id: string = "";
  let to_location_name: string | undefined;
  if (toLocVal && typeof toLocVal === "object" && "_id" in toLocVal) {
    to_location_id = toLocVal._id.toString();
    to_location_name = toLocVal.name;
  } else if (typeof toLocVal === "string") {
    to_location_id = toLocVal;
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
    date_transferred: d.date_transferred as Date,
    from_location_id,
    from_location_name,
    to_location_id,
    to_location_name,
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

function applyPopulates(query: ReturnType<typeof TransferModel.find>) {
  return query
    .populate("from_location_id", "name")
    .populate("to_location_id", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

async function ensureLocationModel() {
  await import("@/lib/db/models/location");
}

export async function getTransfers(filters?: TransferFilters): Promise<Transfer[]> {
  await connectDB();
  await ensureLocationModel();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { code: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.code) {
    query.code = { $regex: filters.code, $options: "i" };
  }

  if (filters?.from_location_id) {
    query.from_location_id = filters.from_location_id;
  }

  if (filters?.to_location_id) {
    query.to_location_id = filters.to_location_id;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.date_from) {
    query.date_transferred = { ...query.date_transferred as Record<string, unknown>, $gte: new Date(filters.date_from) };
  }

  if (filters?.date_to) {
    const endDate = new Date(filters.date_to);
    endDate.setHours(23, 59, 59, 999);
    query.date_transferred = { ...query.date_transferred as Record<string, unknown>, $lte: endDate };
  }

  const transfers = await applyPopulates(
    TransferModel.find(query).sort({ created_at: -1 }).lean()
  );

  return transfers.map((d) => toTransfer(d as unknown as Record<string, unknown>));
}

export async function getTransferById(id: string): Promise<Transfer | null> {
  await connectDB();
  await ensureLocationModel();

  const transfer = await applyPopulates(TransferModel.findById(id).lean());

  if (!transfer) return null;

  return toTransfer(transfer as unknown as Record<string, unknown>);
}

export async function createTransfer(data: CreateTransferInput): Promise<Transfer> {
  await connectDB();

  const code = await generateTransferCode();

  const transfer = await TransferModel.create({
    code,
    date_transferred: data.date_transferred,
    from_location_id: data.from_location_id,
    to_location_id: data.to_location_id,
    remarks: data.remarks || null,
    status: "Active",
  });

  const created = await applyPopulates(TransferModel.findById(transfer._id).lean());

  if (!created) throw new Error("Failed to create transfer");

  return toTransfer(created as unknown as Record<string, unknown>);
}

export async function updateTransfer(id: string, data: UpdateTransferInput): Promise<Transfer> {
  await connectDB();

  const existing = await TransferModel.findById(id);
  if (!existing) throw new Error("Transfer not found");
  if (existing.status !== "Active") throw new Error("Can only edit Active transfers");

  const updateData: Record<string, unknown> = {};
  if (data.date_transferred !== undefined) updateData.date_transferred = data.date_transferred;
  if (data.from_location_id !== undefined) updateData.from_location_id = data.from_location_id;
  if (data.to_location_id !== undefined) updateData.to_location_id = data.to_location_id;
  if (data.remarks !== undefined) updateData.remarks = data.remarks || null;
  updateData.updated_at = new Date();

  const transfer = await applyPopulates(
    TransferModel.findByIdAndUpdate(id, updateData, { new: true }).lean()
  );

  if (!transfer) throw new Error("Transfer not found");

  return toTransfer(transfer as unknown as Record<string, unknown>);
}

export async function cancelTransfer(id: string): Promise<void> {
  await connectDB();

  const existing = await TransferModel.findById(id);
  if (!existing) throw new Error("Transfer not found");
  if (existing.status !== "Active") throw new Error("Can only cancel Active transfers");

  await TransferModel.findByIdAndUpdate(id, {
    status: "Cancelled",
    updated_at: new Date(),
  });

  await TransferItemModel.updateMany(
    { transfer_id: id, status: "Active" },
    { status: "Cancelled", updated_at: new Date() }
  );
}

export async function completeTransfer(id: string): Promise<void> {
  const session = await startSession();
  session.startTransaction();

  try {
    const transfer = await TransferModel.findById(id).session(session);
    if (!transfer) throw new Error("Transfer not found");
    if (transfer.status !== "Active") throw new Error("Can only complete Active transfers");

    const items = await TransferItemModel.find({
      transfer_id: id,
      status: "Active",
    }).session(session);

    if (items.length === 0) throw new Error("No active transfer items to process");

    for (const item of items) {
      // a. Verify sufficient stock at source location
      const sourceStockLevel = await StockLevelModel.findOne({
        item_id: item.item_id,
        location_id: transfer.from_location_id,
      }).session(session);

      if (!sourceStockLevel || sourceStockLevel.qty < item.qty) {
        throw new Error(
          `Insufficient stock for item. Available: ${sourceStockLevel?.qty || 0}, Required: ${item.qty}`
        );
      }

      // b. Decrement source location StockLevel
      await StockLevelModel.findByIdAndUpdate(sourceStockLevel._id, {
        $inc: { qty: -item.qty },
      }).session(session);

      // c. Increment destination location StockLevel (find or create)
      const destStockLevel = await StockLevelModel.findOne({
        item_id: item.item_id,
        location_id: transfer.to_location_id,
      }).session(session);

      if (destStockLevel) {
        await StockLevelModel.findByIdAndUpdate(destStockLevel._id, {
          $inc: { qty: item.qty },
        }).session(session);
      } else {
        await StockLevelModel.create(
          [{
            item_id: item.item_id,
            location_id: transfer.to_location_id,
            qty: item.qty,
          }],
          { session }
        );
      }

      // d. Create StockMovement record (outbound from source)
      await StockMovementModel.create(
        [{
          date: new Date(),
          transaction_type: "TRANSFER",
          item_id: item.item_id,
          location_id: transfer.from_location_id,
          qty: -item.qty,
          reference_trans_id: transfer._id,
          reference_item_id: item._id,
          reference_description: `${transfer.code} ${item.code}`,
        }],
        { session }
      );

      // e. Create StockMovement record (inbound to destination)
      await StockMovementModel.create(
        [{
          date: new Date(),
          transaction_type: "TRANSFER",
          item_id: item.item_id,
          location_id: transfer.to_location_id,
          qty: item.qty,
          reference_trans_id: transfer._id,
          reference_item_id: item._id,
          reference_description: `${transfer.code} ${item.code}`,
        }],
        { session }
      );

      // f. Update transfer item status
      await TransferItemModel.findByIdAndUpdate(item._id, {
        status: "Completed",
        updated_at: new Date(),
      }).session(session);
    }

    // g. Update transfer status
    await TransferModel.findByIdAndUpdate(id, {
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

export async function deleteTransfer(id: string, reason?: string): Promise<void> {
  await connectDB();

  await TransferModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Cancelled",
    updated_at: new Date(),
  });
}
