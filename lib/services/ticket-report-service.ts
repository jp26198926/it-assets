import { connectDB } from "@/lib/db/connection";
import { Ticket as TicketModel } from "@/lib/db/models/ticket";
import { TicketCategory as TicketCategoryModel } from "@/lib/db/models/ticket-category";
import { Department as DepartmentModel } from "@/lib/db/models/department";
import { Asset as AssetModel } from "@/lib/db/models/asset";
import { User as UserModel } from "@/lib/db/models/user";
import { getAppSettings } from "./application-service";
import { startOfDayInTimezone, endOfDayInTimezone, formatInAppTimezone } from "@/lib/utils/timezone";
import type {
  TicketReportFilters,
  TicketTotalItem,
  TicketReportSummary,
  TicketReportTotals,
} from "@/lib/types/ticket-report";
import type { Ticket } from "@/lib/types/ticket";

function buildDateFilter(filters: TicketReportFilters, timezone?: string | null): Record<string, unknown> {
  const match: Record<string, unknown> = {};

  if (filters.status && filters.status.length > 0) {
    match.status = { $in: filters.status };
  } else {
    match.status = { $ne: "Deleted" };
  }

  if (filters.date_from || filters.date_to) {
    const dateRange: Record<string, Date> = {};
    if (filters.date_from) dateRange.$gte = startOfDayInTimezone(new Date(filters.date_from), timezone);
    if (filters.date_to) dateRange.$lte = endOfDayInTimezone(new Date(filters.date_to), timezone);
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

  const { timezone } = await getAppSettings();
  const match = buildDateFilter(filters, timezone);
  const tickets = await populateQuery(
    TicketModel.find(match).sort({ created_at: -1 })
  ).lean();

  return tickets.map((d) => toTicket(d as unknown as Record<string, unknown>));
}

export async function getTicketSummary(filters: TicketReportFilters): Promise<TicketReportSummary> {
  await connectDB();

  const { timezone } = await getAppSettings();
  const match = buildDateFilter(filters, timezone);

  const tickets = await TicketModel.find(match, { created_at: 1, status: 1 }).lean();

  const dailyMap = new Map<string, { count: number; open: number; in_progress: number; resolved: number; closed: number }>();
  const monthlyMap = new Map<string, { count: number; open: number; in_progress: number; resolved: number; closed: number }>();

  for (const ticket of tickets) {
    const dayLabel = formatInAppTimezone(ticket.created_at, "yyyy-MM-dd", timezone);
    const monthLabel = formatInAppTimezone(ticket.created_at, "yyyy-MM", timezone);

    const dayEntry = dailyMap.get(dayLabel);
    if (dayEntry) {
      dayEntry.count++;
      if (ticket.status === "Open") dayEntry.open++;
      else if (ticket.status === "In Progress") dayEntry.in_progress++;
      else if (ticket.status === "Resolved") dayEntry.resolved++;
      else if (ticket.status === "Closed") dayEntry.closed++;
    } else {
      dailyMap.set(dayLabel, {
        count: 1,
        open: ticket.status === "Open" ? 1 : 0,
        in_progress: ticket.status === "In Progress" ? 1 : 0,
        resolved: ticket.status === "Resolved" ? 1 : 0,
        closed: ticket.status === "Closed" ? 1 : 0,
      });
    }

    const monthEntry = monthlyMap.get(monthLabel);
    if (monthEntry) {
      monthEntry.count++;
      if (ticket.status === "Open") monthEntry.open++;
      else if (ticket.status === "In Progress") monthEntry.in_progress++;
      else if (ticket.status === "Resolved") monthEntry.resolved++;
      else if (ticket.status === "Closed") monthEntry.closed++;
    } else {
      monthlyMap.set(monthLabel, {
        count: 1,
        open: ticket.status === "Open" ? 1 : 0,
        in_progress: ticket.status === "In Progress" ? 1 : 0,
        resolved: ticket.status === "Resolved" ? 1 : 0,
        closed: ticket.status === "Closed" ? 1 : 0,
      });
    }
  }

  const daily = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, v]) => ({ label, ...v }));

  const weekMap = new Map<string, { count: number; open: number; in_progress: number; resolved: number; closed: number }>();
  for (const d of daily) {
    const parts = d.label.split("-");
    const dt = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    const dayOfWeek = dt.getUTCDay() || 7;
    dt.setUTCDate(dt.getUTCDate() + 4 - dayOfWeek);
    const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((+dt - +yearStart) / 86400000 + 1) / 7);
    const key = `${dt.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
    const existing = weekMap.get(key);
    if (existing) {
      existing.count += d.count;
      existing.open += d.open;
      existing.in_progress += d.in_progress;
      existing.resolved += d.resolved;
      existing.closed += d.closed;
    } else {
      weekMap.set(key, { count: d.count, open: d.open, in_progress: d.in_progress, resolved: d.resolved, closed: d.closed });
    }
  }
  const weekly = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => {
      const [y, w] = key.split("-W");
      return { label: `W${w} ${y}`, ...v };
    });

  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, v]) => ({ label, ...v }));

  return { daily, weekly, monthly };
}

export async function getTicketTotals(filters: TicketReportFilters): Promise<TicketReportTotals> {
  await connectDB();

  const { timezone } = await getAppSettings();
  const match = buildDateFilter(filters, timezone);

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
