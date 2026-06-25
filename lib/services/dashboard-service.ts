import { connectDB } from "@/lib/db/connection";
import { Asset as AssetModel } from "@/lib/db/models/asset";
import { Ticket as TicketModel } from "@/lib/db/models/ticket";
import { Assignment as AssignmentModel } from "@/lib/db/models/assignment";
import type {
  DashboardStats,
  DashboardAssetStatus,
  DashboardTicketStatus,
  DashboardAssignmentStatus,
  DashboardRecentAsset,
  DashboardRecentTicket,
  DashboardNameCount,
  DashboardTrendPoint,
} from "@/lib/types/dashboard";

function mapStatusCount(
  results: Array<{ _id: string; count: number }>,
  expectedStatuses: string[]
): { total: number; counts: Record<string, number> } {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of results) {
    counts[r._id] = r.count;
    total += r.count;
  }
  for (const s of expectedStatuses) {
    if (!(s in counts)) counts[s] = 0;
  }
  return { total, counts };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();
  await import("@/lib/db/models/category");
  await import("@/lib/db/models/uom");
  await import("@/lib/db/models/item");
  await import("@/lib/db/models/location");
  await import("@/lib/db/models/employee");
  await import("@/lib/db/models/user");

  const notDeleted = { deleted_at: null };

  const [
    assetStatusResults,
    ticketStatusResults,
    assignmentStatusResults,
    recentAssetsRaw,
    recentTicketsRaw,
    assetByCategoryRaw,
    assetByLocationRaw,
    ticketByPriorityRaw,
    ticketTrendRaw,
  ] = await Promise.all([
    AssetModel.aggregate([
      { $match: notDeleted },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    TicketModel.aggregate([
      { $match: { status: { $ne: "Deleted" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    AssignmentModel.aggregate([
      { $match: notDeleted },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    AssetModel.find(notDeleted)
      .populate({ path: "item_id", select: "name category_id", populate: { path: "category_id", select: "name" } })
      .populate("location_id", "name")
      .populate("assigned_to_employee", "firstname lastname")
      .sort({ created_at: -1 })
      .limit(5)
      .lean(),
    TicketModel.find({ status: { $ne: "Deleted" } })
      .populate("assigned_to", "first_name last_name")
      .sort({ created_at: -1 })
      .limit(5)
      .lean(),
    AssetModel.aggregate([
      { $match: notDeleted },
      { $lookup: { from: "items", localField: "item_id", foreignField: "_id", as: "item" } },
      { $unwind: { path: "$item", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "categories", localField: "item.category_id", foreignField: "_id", as: "cat" } },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$cat.name", "Uncategorized"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    AssetModel.aggregate([
      { $match: notDeleted },
      { $lookup: { from: "locations", localField: "location_id", foreignField: "_id", as: "loc" } },
      { $unwind: { path: "$loc", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$loc.name", "No Location"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    TicketModel.aggregate([
      { $match: { status: { $ne: "Deleted" } } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    TicketModel.aggregate([
      {
        $match: {
          status: { $ne: "Deleted" },
          created_at: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const assetStatus = mapStatusCount(assetStatusResults, [
    "Available", "Assigned", "Repair", "Lost", "Disposed",
  ]);
  const assets: DashboardAssetStatus = {
    total: assetStatus.total,
    available: assetStatus.counts["Available"] || 0,
    assigned: assetStatus.counts["Assigned"] || 0,
    repair: assetStatus.counts["Repair"] || 0,
    lost: assetStatus.counts["Lost"] || 0,
    disposed: assetStatus.counts["Disposed"] || 0,
  };

  const ticketStatus = mapStatusCount(ticketStatusResults, [
    "Open", "In Progress", "Resolved", "Closed",
  ]);
  const tickets: DashboardTicketStatus = {
    total: ticketStatus.total,
    open: ticketStatus.counts["Open"] || 0,
    inProgress: ticketStatus.counts["In Progress"] || 0,
    resolved: ticketStatus.counts["Resolved"] || 0,
    closed: ticketStatus.counts["Closed"] || 0,
  };

  const assignmentStatus = mapStatusCount(assignmentStatusResults, [
    "Active", "Returned", "Lost",
  ]);
  const assignments: DashboardAssignmentStatus = {
    active: assignmentStatus.counts["Active"] || 0,
    returned: assignmentStatus.counts["Returned"] || 0,
    lost: assignmentStatus.counts["Lost"] || 0,
  };

  const recentAssets: DashboardRecentAsset[] = recentAssetsRaw.map((d) => {
    const item = d.item_id as unknown as { name?: string; category_id?: { name?: string } } | null;
    const loc = d.location_id as unknown as { name?: string } | null;
    const emp = d.assigned_to_employee as unknown as { firstname?: string; lastname?: string } | null;
    return {
      id: (d._id as { toString(): string }).toString(),
      barcode: d.barcode as string,
      item_name: item?.name || "N/A",
      category_name: item?.category_id?.name || "N/A",
      location_name: loc?.name || "N/A",
      assigned_to_employee_name: emp ? `${emp.firstname || ""} ${emp.lastname || ""}`.trim() : "N/A",
      status: d.status as string,
      created_at: d.created_at as Date,
    };
  });

  const recentTickets: DashboardRecentTicket[] = recentTicketsRaw.map((d) => {
    const assignedTo = d.assigned_to as unknown as { first_name?: string; last_name?: string } | null;
    return {
      id: (d._id as { toString(): string }).toString(),
      ticket_no: d.ticket_no as string,
      title: d.title as string,
      priority: d.priority as string,
      status: d.status as string,
      assigned_to_name: assignedTo
        ? `${assignedTo.first_name || ""} ${assignedTo.last_name || ""}`.trim()
        : "Unassigned",
      created_at: d.created_at as Date,
    };
  });

  const assetByCategory: DashboardNameCount[] = assetByCategoryRaw.map((d) => ({
    name: d._id as string,
    count: d.count,
  }));

  const assetByLocation: DashboardNameCount[] = assetByLocationRaw.map((d) => ({
    name: d._id as string,
    count: d.count,
  }));

  const ticketByPriority: DashboardNameCount[] = ticketByPriorityRaw.map((d) => ({
    name: d._id as string,
    count: d.count,
  }));

  const ticketTrend: DashboardTrendPoint[] = ticketTrendRaw.map((d) => ({
    date: d._id as string,
    count: d.count,
  }));

  return {
    assets,
    tickets,
    assignments,
    recentAssets,
    recentTickets,
    assetByCategory,
    assetByLocation,
    ticketByPriority,
    ticketTrend,
  };
}
