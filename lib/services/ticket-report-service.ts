import { connectDB } from "@/lib/db/connection";
import { Ticket as TicketModel } from "@/lib/db/models/ticket";
import type {
  TicketReportFilters,
  TicketTotalItem,
  TicketReportSummary,
  TicketReportTotals,
} from "@/lib/types/ticket-report";
import type { Ticket } from "@/lib/types/ticket";

function buildDateFilter(filters: TicketReportFilters): Record<string, unknown> {
  const match: Record<string, unknown> = {};

  if (filters.status && filters.status.length > 0) {
    match.status = { $in: filters.status };
  } else {
    match.status = { $ne: "Deleted" };
  }

  if (filters.date_from || filters.date_to) {
    const dateRange: Record<string, Date> = {};
    if (filters.date_from) dateRange.$gte = new Date(filters.date_from);
    if (filters.date_to) {
      const to = new Date(filters.date_to);
      to.setHours(23, 59, 59, 999);
      dateRange.$lte = to;
    }
    match.created_at = dateRange;
  }

  if (filters.technician_id) match.assigned_to = filters.technician_id;
  if (filters.department_id) match.department_id = filters.department_id;
  if (filters.requestor_id) match.requestor_id = filters.requestor_id;

  return match;
}

function toTicket(d: Record<string, unknown>): Ticket {
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

  const categoryId = d.category_id as unknown as { _id: { toString(): string }; name: string } | string;
  let category_id: string;
  let category_name: string | undefined;
  if (typeof categoryId === "string") {
    category_id = categoryId;
  } else {
    category_id = categoryId._id.toString();
    category_name = categoryId.name;
  }

  const departmentId = d.department_id as unknown as { _id: { toString(): string }; name: string } | string | null;
  let department_id: string | null = null;
  let department_name: string | undefined;
  if (departmentId && typeof departmentId === "object" && "_id" in departmentId) {
    department_id = departmentId._id.toString();
    department_name = departmentId.name;
  } else if (typeof departmentId === "string") {
    department_id = departmentId;
  }

  const assetId = d.asset_id as unknown as { _id: { toString(): string }; barcode?: string; item_name?: string } | string | null;
  let asset_id: string | null = null;
  let asset_name: string | undefined;
  if (assetId && typeof assetId === "object" && "_id" in assetId) {
    asset_id = assetId._id.toString();
    asset_name = assetId.barcode || assetId.item_name;
  } else if (typeof assetId === "string") {
    asset_id = assetId;
  }

  const assignedToVal = d.assigned_to as unknown as { _id: { toString(): string }; first_name: string; last_name: string } | string | null;
  let assigned_to: string | null = null;
  let assigned_to_name: string | undefined;
  if (assignedToVal && typeof assignedToVal === "object" && "_id" in assignedToVal) {
    assigned_to = assignedToVal._id.toString();
    assigned_to_name = `${assignedToVal.first_name} ${assignedToVal.last_name}`.trim();
  } else if (typeof assignedToVal === "string") {
    assigned_to = assignedToVal;
  }

  const requestorVal = d.requestor_id as unknown as { _id: { toString(): string }; first_name: string; last_name: string } | string | null;
  let requestor_id: string | null = null;
  let requestor_name: string | undefined;
  if (requestorVal && typeof requestorVal === "object" && "_id" in requestorVal) {
    requestor_id = requestorVal._id.toString();
    requestor_name = `${requestorVal.first_name} ${requestorVal.last_name}`.trim();
  } else if (typeof requestorVal === "string") {
    requestor_id = requestorVal;
  }

  return {
    id: (d._id as { toString(): string }).toString(),
    ticket_no: d.ticket_no as string,
    name: d.name as string,
    email: d.email as string,
    requestor_id,
    requestor_name,
    title: d.title as string,
    description: d.description as string,
    category_id,
    category_name,
    department_id,
    department_name,
    priority: d.priority as "Low" | "Medium" | "High" | "Critical",
    asset_id,
    asset_name,
    asset_status: (d.asset_status as string) ?? null,
    assigned_to,
    assigned_to_name,
    attachments: (d.attachments as string[]) || [],
    status: d.status as "Open" | "In Progress" | "Resolved" | "Closed" | "Deleted",
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

function populateQuery(query: ReturnType<typeof TicketModel.find>) {
  return query
    .populate("category_id", "name")
    .populate("department_id", "name")
    .populate("asset_id", "barcode item_name")
    .populate("assigned_to", "first_name last_name")
    .populate("requestor_id", "first_name last_name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getFilteredTickets(filters: TicketReportFilters): Promise<Ticket[]> {
  await connectDB();

  const match = buildDateFilter(filters);
  const tickets = await populateQuery(
    TicketModel.find(match).sort({ created_at: -1 })
  ).lean();

  return tickets.map((d) => toTicket(d as unknown as Record<string, unknown>));
}

export async function getTicketSummary(filters: TicketReportFilters): Promise<TicketReportSummary> {
  await connectDB();

  const match = buildDateFilter(filters);

  const [daily, weekly, monthly] = await Promise.all([
    TicketModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          count: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    TicketModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            week: { $isoWeek: "$created_at" },
          },
          count: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]),
    TicketModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          count: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    daily: daily.map((d) => ({
      label: d._id,
      count: d.count,
      open: d.open,
      in_progress: d.in_progress,
      resolved: d.resolved,
      closed: d.closed,
    })),
    weekly: weekly.map((d) => ({
      label: `W${d._id.week} ${d._id.year}`,
      count: d.count,
      open: d.open,
      in_progress: d.in_progress,
      resolved: d.resolved,
      closed: d.closed,
    })),
    monthly: monthly.map((d) => ({
      label: d._id,
      count: d.count,
      open: d.open,
      in_progress: d.in_progress,
      resolved: d.resolved,
      closed: d.closed,
    })),
  };
}

export async function getTicketTotals(filters: TicketReportFilters): Promise<TicketReportTotals> {
  await connectDB();

  const match = buildDateFilter(filters);

  const [byRequestor, byTechnician, byDepartment, byAsset, byCategory] = await Promise.all([
    TicketModel.aggregate([
      { $match: match },
      { $group: { _id: "$requestor_id", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          name: {
            $cond: {
              if: "$user",
              then: { $concat: ["$user.first_name", " ", "$user.last_name"] },
              else: "Unknown",
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),
    TicketModel.aggregate([
      { $match: match },
      { $group: { _id: "$assigned_to", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          name: {
            $cond: {
              if: "$user",
              then: { $concat: ["$user.first_name", " ", "$user.last_name"] },
              else: "Unassigned",
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),
    TicketModel.aggregate([
      { $match: match },
      { $group: { _id: "$department_id", count: { $sum: 1 } } },
      { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "dept" } },
      { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          name: {
            $cond: {
              if: "$dept",
              then: "$dept.name",
              else: "No Department",
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),
    TicketModel.aggregate([
      { $match: { ...match, asset_id: { $ne: null } } },
      { $group: { _id: "$asset_id", count: { $sum: 1 } } },
      { $lookup: { from: "assets", localField: "_id", foreignField: "_id", as: "asset" } },
      { $unwind: { path: "$asset", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "items",
          localField: "asset.item_id",
          foreignField: "_id",
          as: "item",
        },
      },
      { $unwind: { path: "$item", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          name: {
            $cond: {
              if: "$item",
              then: "$item.name",
              else: { $ifNull: ["$asset.barcode", "Unknown Asset"] },
            },
          },
          barcode: { $ifNull: ["$asset.barcode", null] },
          serial: { $ifNull: ["$asset.serial_number", null] },
        },
      },
      { $sort: { count: -1 } },
    ]),
    TicketModel.aggregate([
      { $match: match },
      { $group: { _id: "$category_id", count: { $sum: 1 } } },
      { $lookup: { from: "ticket_categories", localField: "_id", foreignField: "_id", as: "cat" } },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          name: {
            $cond: {
              if: "$cat",
              then: "$cat.name",
              else: "Unknown Category",
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  const mapTotal = (items: Array<{ _id: string | null; count: number; name: string; serial?: string | null; barcode?: string | null }>): TicketTotalItem[] =>
    items.map((item) => ({
      id: item._id || "unknown",
      name: item.name,
      count: item.count,
      ...(item.barcode ? { barcode: item.barcode } : {}),
      ...(item.serial ? { serial: item.serial } : {}),
    }));

  return {
    by_requestor: mapTotal(byRequestor),
    by_technician: mapTotal(byTechnician),
    by_department: mapTotal(byDepartment),
    by_asset: mapTotal(byAsset),
    by_category: mapTotal(byCategory),
  };
}
