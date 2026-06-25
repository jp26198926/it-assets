import { connectDB } from "@/lib/db/connection";
import { Assignment as AssignmentModel } from "@/lib/db/models/assignment";
import type { CreateAssignmentInput, UpdateAssignmentInput, ReturnAssignmentInput, MarkAsLostInput, AssignmentFilters, Assignment } from "@/lib/types/assignment";

function toAssignment(d: Record<string, unknown>): Assignment {
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
    asset_id: (d.asset_id as { toString(): string }).toString(),
    employee_id: d.employee_id ? (d.employee_id as { toString(): string }).toString() : null,
    department_id: d.department_id ? (d.department_id as { toString(): string }).toString() : null,
    location_id: d.location_id ? (d.location_id as { toString(): string }).toString() : null,
    assigned_date: d.assigned_date as Date,
    returned_date: (d.returned_date as Date) ?? null,
    condition_on_issue: d.condition_on_issue as string,
    condition_on_return: (d.condition_on_return as string) ?? null,
    remarks: (d.remarks as string) ?? null,
    status: d.status as "Active" | "Returned" | "Lost",
    date_lost: (d.date_lost as Date) ?? null,
    lost_reason: (d.lost_reason as string) ?? null,
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

async function enrichAssignment(d: Record<string, unknown>): Promise<Assignment> {
  const assignment = toAssignment(d);
  const { Asset } = await import("@/lib/db/models/asset");
  const { Employee } = await import("@/lib/db/models/employee");
  const { Department } = await import("@/lib/db/models/department");

  const { Location } = await import("@/lib/db/models/location");
  const { Item } = await import("@/lib/db/models/item");
  const { Category } = await import("@/lib/db/models/category");
  void Item;
  void Category;

  const [asset, employee, department, location] = await Promise.all([
    Asset.findById(assignment.asset_id)
      .populate({ path: "item_id", select: "name category_id", populate: { path: "category_id", select: "name" } })
      .lean()
      .catch(() => null),
    assignment.employee_id ? Employee.findById(assignment.employee_id).lean().catch(() => null) : null,
    assignment.department_id ? Department.findById(assignment.department_id).lean().catch(() => null) : null,
    assignment.location_id ? Location.findById(assignment.location_id).lean().catch(() => null) : null,
  ]);

  if (asset) {
    const a = asset as unknown as Record<string, unknown>;
    assignment.asset_barcode = a.barcode as string;
    assignment.serial_number = (a.serial_number as string) ?? null;
    const item = a.item_id as unknown as Record<string, unknown> | null;
    if (item) {
      assignment.item_name = item.name as string;
      const cat = item.category_id as unknown as Record<string, unknown> | null;
      if (cat) {
        assignment.item_category_name = cat.name as string;
      }
    }
  }
  if (employee) {
    const e = employee as unknown as Record<string, unknown>;
    assignment.employee_name = `${e.firstname ?? ""} ${e.lastname ?? ""}`.trim();
  }
  if (department) {
    const dep = department as unknown as Record<string, unknown>;
    assignment.department_name = dep.name as string;
  }
  if (location) {
    const loc = location as unknown as Record<string, unknown>;
    assignment.location_name = loc.name as string;
  }

  return assignment;
}

export async function getAssignmentSelectOptions(currentAssetId?: string): Promise<{
  assets: { id: string; barcode: string; itemName: string }[];
  employees: { id: string; name: string; departmentId: string | null }[];
  departments: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}> {
  await connectDB();

  const { Asset } = await import("@/lib/db/models/asset");
  const { Item } = await import("@/lib/db/models/item");
  const { Employee } = await import("@/lib/db/models/employee");
  const { Department } = await import("@/lib/db/models/department");
  const { Location } = await import("@/lib/db/models/location");

  const assetQuery: Record<string, unknown> = { deleted_at: null };
  if (currentAssetId) {
    assetQuery.$or = [{ status: "Available" }, { _id: currentAssetId }];
  } else {
    assetQuery.status = "Available";
  }

  const availableAssets = await Asset.find(assetQuery)
    .populate("item_id", "name")
    .sort({ barcode: 1 })
    .lean();

  const employees = await Employee.find({ deleted_at: null, status: "Active" })
    .select("firstname lastname department_id")
    .sort({ lastname: 1, firstname: 1 })
    .lean();

  const departments = await Department.find({ deleted_at: null, status: "Active" })
    .select("name")
    .sort({ name: 1 })
    .lean();

  const locations = await Location.find({ deleted_at: null, status: "Active" })
    .select("name")
    .sort({ name: 1 })
    .lean();

  return {
    assets: availableAssets.map((a) => {
      const item = a.item_id as unknown as { name?: string } | null;
      return {
        id: (a._id as { toString(): string }).toString(),
        barcode: a.barcode,
        itemName: item?.name ?? "Unknown Item",
      };
    }),
    employees: employees.map((e) => ({
      id: (e._id as { toString(): string }).toString(),
      name: `${e.firstname} ${e.lastname}`,
      departmentId: e.department_id
        ? (e.department_id as { toString(): string }).toString()
        : null,
    })),
    departments: departments.map((d) => ({
      id: (d._id as { toString(): string }).toString(),
      name: d.name,
    })),
    locations: locations.map((l) => ({
      id: (l._id as { toString(): string }).toString(),
      name: l.name,
    })),
  };
}

export async function getAssignments(filters?: AssignmentFilters): Promise<Assignment[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { condition_on_issue: { $regex: filters.search, $options: "i" } },
      { condition_on_return: { $regex: filters.search, $options: "i" } },
      { remarks: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.asset_id) {
    query.asset_id = filters.asset_id;
  }

  if (filters?.employee_id) {
    query.employee_id = filters.employee_id;
  }

  if (filters?.department_id) {
    query.department_id = filters.department_id;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const assignments = await AssignmentModel.find(query)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .sort({ created_at: -1 })
    .lean();

  return Promise.all(assignments.map((d) => enrichAssignment(d as unknown as Record<string, unknown>)));
}

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  await connectDB();

  const assignment = await AssignmentModel.findById(id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!assignment) return null;

  return enrichAssignment(assignment as unknown as Record<string, unknown>);
}

export async function createAssignment(data: CreateAssignmentInput): Promise<Assignment> {
  await connectDB();

  const assignment = await AssignmentModel.create({
    asset_id: data.asset_id,
    employee_id: data.employee_id || null,
    department_id: data.department_id || null,
    location_id: data.location_id || null,
    assigned_date: data.assigned_date,
    returned_date: data.returned_date || null,
    condition_on_issue: data.condition_on_issue,
    condition_on_return: data.condition_on_return || null,
    remarks: data.remarks || null,
    status: data.status || "Active",
    created_by: data.created_by || null,
  });

  const { Asset } = await import("@/lib/db/models/asset");
  await Asset.findByIdAndUpdate(data.asset_id, {
    status: "Assigned",
    assigned_to_employee: data.employee_id || null,
    assigned_to_department: data.department_id || null,
    location_id: data.location_id || null,
    updated_at: new Date(),
  });

  const created = await AssignmentModel.findById(assignment._id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!created) throw new Error("Failed to create assignment");

  return enrichAssignment(created as unknown as Record<string, unknown>);
}

export async function updateAssignment(id: string, data: UpdateAssignmentInput): Promise<Assignment> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.asset_id !== undefined) updateData.asset_id = data.asset_id;
  if (data.employee_id !== undefined) updateData.employee_id = data.employee_id || null;
  if (data.department_id !== undefined) updateData.department_id = data.department_id || null;
  if (data.location_id !== undefined) updateData.location_id = data.location_id || null;
  if (data.assigned_date !== undefined) updateData.assigned_date = data.assigned_date;
  if (data.returned_date !== undefined) updateData.returned_date = data.returned_date || null;
  if (data.condition_on_issue !== undefined) updateData.condition_on_issue = data.condition_on_issue;
  if (data.condition_on_return !== undefined) updateData.condition_on_return = data.condition_on_return || null;
  if (data.remarks !== undefined) updateData.remarks = data.remarks || null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.updated_by !== undefined) updateData.updated_by = data.updated_by || null;
  updateData.updated_at = new Date();

  const assignment = await AssignmentModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!assignment) throw new Error("Assignment not found");

  if (data.location_id !== undefined || data.asset_id !== undefined) {
    const { Asset } = await import("@/lib/db/models/asset");
    const assetUpdate: Record<string, unknown> = { updated_at: new Date() };
    if (data.location_id !== undefined) assetUpdate.location_id = data.location_id || null;
    await Asset.findByIdAndUpdate(data.asset_id || (assignment as unknown as Record<string, unknown>).asset_id, assetUpdate);
  }

  return enrichAssignment(assignment as unknown as Record<string, unknown>);
}

export async function returnAssignment(id: string, data: ReturnAssignmentInput, userId?: string | null): Promise<Assignment> {
  await connectDB();

  const existing = await AssignmentModel.findById(id).lean();
  if (!existing) throw new Error("Assignment not found");

  const assetId = (existing as unknown as Record<string, unknown>).asset_id as { toString(): string };

  await AssignmentModel.findByIdAndUpdate(id, {
    returned_date: data.returned_date,
    condition_on_return: data.condition_on_return,
    status: "Returned",
    updated_by: userId || null,
    updated_at: new Date(),
  });

  const { Asset } = await import("@/lib/db/models/asset");
  await Asset.findByIdAndUpdate(assetId.toString(), {
    status: "Available",
    assigned_to_employee: null,
    assigned_to_department: null,
    location_id: data.location_id || null,
    updated_at: new Date(),
  });

  const assignment = await AssignmentModel.findById(id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!assignment) throw new Error("Assignment not found");

  return enrichAssignment(assignment as unknown as Record<string, unknown>);
}

export async function markAsLost(id: string, data: MarkAsLostInput, userId?: string | null): Promise<Assignment> {
  await connectDB();

  const existing = await AssignmentModel.findById(id).lean();
  if (!existing) throw new Error("Assignment not found");

  const assetId = (existing as unknown as Record<string, unknown>).asset_id as { toString(): string };

  await AssignmentModel.findByIdAndUpdate(id, {
    status: "Lost",
    date_lost: data.date_lost,
    lost_reason: data.lost_reason,
    updated_by: userId || null,
    updated_at: new Date(),
  });

  const { Asset } = await import("@/lib/db/models/asset");
  await Asset.findByIdAndUpdate(assetId.toString(), {
    status: "Lost",
    updated_at: new Date(),
  });

  const assignment = await AssignmentModel.findById(id)
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name")
    .lean();

  if (!assignment) throw new Error("Assignment not found");

  return enrichAssignment(assignment as unknown as Record<string, unknown>);
}

export async function deleteAssignment(id: string, reason?: string): Promise<void> {
  await connectDB();

  await AssignmentModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    updated_at: new Date(),
  });
}

export async function restoreAssignment(id: string): Promise<void> {
  await connectDB();

  await AssignmentModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    updated_at: new Date(),
  });
}
