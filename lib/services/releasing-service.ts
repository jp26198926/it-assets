import { connectDB, startSession } from "@/lib/db/connection";
import { Releasing as ReleasingModel } from "@/lib/db/models/releasing";
import { ReleasingItem as ReleasingItemModel } from "@/lib/db/models/releasing-item";
import { Item as ItemModel } from "@/lib/db/models/item";
import { StockLevel as StockLevelModel } from "@/lib/db/models/stock-level";
import { StockMovement as StockMovementModel } from "@/lib/db/models/stock-movement";
import type { CreateReleasingInput, UpdateReleasingInput, ReleasingFilters, Releasing } from "@/lib/types/releasing";

async function generateReleasingCode(): Promise<string> {
  const last = await ReleasingModel.findOne({ code: { $regex: "^RLS\\d{5}$" } })
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

  return `RLS${String(nextNumber).padStart(5, "0")}`;
}

function toReleasing(d: Record<string, unknown>): Releasing {
  const locVal = d.from_location_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string
    | null;

  let from_location_id: string | null = null;
  let from_location_name: string | undefined;
  if (locVal && typeof locVal === "object" && "_id" in locVal) {
    from_location_id = locVal._id.toString();
    from_location_name = locVal.name;
  } else if (typeof locVal === "string") {
    from_location_id = locVal;
  }

  const deptVal = d.to_department_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string
    | null;

  let to_department_id: string | null = null;
  let to_department_name: string | undefined;
  if (deptVal && typeof deptVal === "object" && "_id" in deptVal) {
    to_department_id = deptVal._id.toString();
    to_department_name = deptVal.name;
  } else if (typeof deptVal === "string") {
    to_department_id = deptVal;
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
    date_released: d.date_released as Date,
    from_location_id,
    from_location_name,
    to_department_id,
    to_department_name,
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

function applyPopulates(query: ReturnType<typeof ReleasingModel.find>) {
  return query
    .populate("from_location_id", "name")
    .populate("to_department_id", "name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getReleasings(filters?: ReleasingFilters): Promise<Releasing[]> {
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

  if (filters?.from_location_id) {
    query.from_location_id = filters.from_location_id;
  }

  if (filters?.to_department_id) {
    query.to_department_id = filters.to_department_id;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.date_from) {
    query.date_released = { $gte: new Date(filters.date_from) };
  }

  if (filters?.date_to) {
    const endDate = new Date(filters.date_to);
    endDate.setHours(23, 59, 59, 999);
    query.date_released = { ...(query.date_released as Record<string, unknown>), $lte: endDate };
  }

  const releasings = await applyPopulates(
    ReleasingModel.find(query).sort({ created_at: -1 }).lean()
  );

  return releasings.map((d) => toReleasing(d as unknown as Record<string, unknown>));
}

export async function getReleasingById(id: string): Promise<Releasing | null> {
  await connectDB();

  const releasing = await applyPopulates(ReleasingModel.findById(id).lean());

  if (!releasing) return null;

  return toReleasing(releasing as unknown as Record<string, unknown>);
}

export async function createReleasing(data: CreateReleasingInput): Promise<Releasing> {
  await connectDB();

  const code = await generateReleasingCode();

  const releasing = await ReleasingModel.create({
    code,
    date_released: data.date_released,
    from_location_id: data.from_location_id || null,
    to_department_id: data.to_department_id || null,
    remarks: data.remarks || null,
    status: "Active",
  });

  const created = await applyPopulates(ReleasingModel.findById(releasing._id).lean());

  if (!created) throw new Error("Failed to create releasing");

  return toReleasing(created as unknown as Record<string, unknown>);
}

export async function updateReleasing(id: string, data: UpdateReleasingInput): Promise<Releasing> {
  await connectDB();

  const existing = await ReleasingModel.findById(id);
  if (!existing) throw new Error("Releasing not found");
  if (existing.status !== "Active") throw new Error("Can only edit Active releasings");

  const updateData: Record<string, unknown> = {};
  if (data.date_released !== undefined) updateData.date_released = data.date_released;
  if (data.from_location_id !== undefined) updateData.from_location_id = data.from_location_id || null;
  if (data.to_department_id !== undefined) updateData.to_department_id = data.to_department_id || null;
  if (data.remarks !== undefined) updateData.remarks = data.remarks || null;
  updateData.updated_at = new Date();

  const releasing = await applyPopulates(
    ReleasingModel.findByIdAndUpdate(id, updateData, { new: true }).lean()
  );

  if (!releasing) throw new Error("Releasing not found");

  return toReleasing(releasing as unknown as Record<string, unknown>);
}

export async function cancelReleasing(id: string): Promise<void> {
  await connectDB();

  const existing = await ReleasingModel.findById(id);
  if (!existing) throw new Error("Releasing not found");
  if (existing.status !== "Active") throw new Error("Can only cancel Active releasings");

  await ReleasingModel.findByIdAndUpdate(id, {
    status: "Cancelled",
    updated_at: new Date(),
  });

  await ReleasingItemModel.updateMany(
    { releasing_id: id, status: "Active" },
    { status: "Cancelled", updated_at: new Date() }
  );
}

export async function completeReleasing(id: string): Promise<void> {
  const session = await startSession();
  session.startTransaction();

  try {
    const releasing = await ReleasingModel.findById(id).session(session);
    if (!releasing) throw new Error("Releasing not found");
    if (releasing.status !== "Active") throw new Error("Can only complete Active releasings");

    const items = await ReleasingItemModel.find({
      releasing_id: id,
      status: "Active",
    }).populate("item_id", "name").session(session);

    if (items.length === 0) throw new Error("No active releasing items to process");

    for (const item of items) {
      const itemData = item.item_id as unknown as { _id: { toString(): string }; name: string };
      const itemName = itemData?.name || "Unknown Item";

      // a. Verify sufficient stock in StockLevel
      if (item.from_location_id) {
        const stockLevel = await StockLevelModel.findOne({
          item_id: item.item_id,
          location_id: item.from_location_id,
        }).session(session);

        if (!stockLevel || stockLevel.qty < item.qty) {
          throw new Error(
            `Insufficient stock for item ${itemName}. Available: ${stockLevel?.qty || 0}, Required: ${item.qty}`
          );
        }

        // b. Decrement item stock
        await ItemModel.findByIdAndUpdate(item.item_id, {
          $inc: { stock: -item.qty },
        }).session(session);

        // c. Decrement StockLevel
        await StockLevelModel.findByIdAndUpdate(stockLevel._id, {
          $inc: { qty: -item.qty },
        }).session(session);

        // d. Create StockMovement
        await StockMovementModel.create(
          [{
            date: new Date(),
            transaction_type: "RELEASE",
            item_id: item.item_id,
            location_id: item.from_location_id,
            qty: item.qty,
            reference_trans_id: releasing._id,
            reference_item_id: item._id,
            reference_description: `${releasing.code} ${item.code}`,
          }],
          { session }
        );
      }

      // e. Update releasing item status
      await ReleasingItemModel.findByIdAndUpdate(item._id, {
        status: "Completed",
        updated_at: new Date(),
      }).session(session);
    }

    // f. Update releasing status
    await ReleasingModel.findByIdAndUpdate(id, {
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

export async function deleteReleasing(id: string, reason?: string): Promise<void> {
  await connectDB();

  await ReleasingModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Cancelled",
    updated_at: new Date(),
  });
}
