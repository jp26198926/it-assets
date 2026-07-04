import { connectDB } from "@/lib/db/connection";
import { MeetingActionItem as MeetingActionItemModel } from "@/lib/db/models/meeting-action-item";
import { Employee as EmployeeModel } from "@/lib/db/models/employee";
import { getAppSettings } from "./application-service";
import { startOfDayInTimezone, endOfDayInTimezone } from "@/lib/utils/timezone";
import type {
  CreateMeetingActionItemInput,
  UpdateMeetingActionItemInput,
  MeetingActionItemFilters,
  MeetingActionItem,
} from "@/lib/types/meeting-action-item";

function toMeetingActionItem(d: Record<string, unknown>): MeetingActionItem {
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

  const meetingVal = d.meeting_id as unknown as
    | { _id: { toString(): string }; title: string; meeting_no: number }
    | string;
  let meeting_id: string;
  let meeting_title: string | undefined;
  let meeting_no: number | undefined;
  if (typeof meetingVal === "string") {
    meeting_id = meetingVal;
  } else {
    meeting_id = meetingVal._id.toString();
    meeting_title = meetingVal.title;
    meeting_no = meetingVal.meeting_no;
  }

  const assignedToVal = d.assigned_to as unknown as
    | { _id: { toString(): string }; firstname: string; lastname: string }
    | string
    | null;
  let assigned_to: string | null = null;
  let assigned_to_name: string | undefined;
  if (assignedToVal && typeof assignedToVal === "object" && "_id" in assignedToVal) {
    assigned_to = assignedToVal._id.toString();
    assigned_to_name = `${assignedToVal.firstname} ${assignedToVal.lastname}`.trim();
  } else if (typeof assignedToVal === "string") {
    assigned_to = assignedToVal;
  }

  const completedByVal = d.completed_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let completed_by: string | null = null;
  let completed_by_name: string | undefined;
  if (completedByVal && typeof completedByVal === "object" && "_id" in completedByVal) {
    completed_by = completedByVal._id.toString();
    completed_by_name = `${completedByVal.first_name} ${completedByVal.last_name}`.trim();
  } else if (typeof completedByVal === "string") {
    completed_by = completedByVal;
  }

  return {
    id: (d._id as { toString(): string }).toString(),
    meeting_id,
    meeting_title,
    meeting_no,
    title: d.title as string,
    description: (d.description as string) ?? null,
    assigned_to,
    assigned_to_name,
    due_date: (d.due_date as Date) ?? null,
    priority: d.priority as MeetingActionItem["priority"],
    status: d.status as MeetingActionItem["status"],
    completed_at: (d.completed_at as Date) ?? null,
    completed_by,
    completed_by_name,
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

function applyPopulates(query: ReturnType<typeof MeetingActionItemModel.find> | ReturnType<typeof MeetingActionItemModel.findById>) {
  return query
    .populate("meeting_id", "title meeting_no")
    .populate("assigned_to", "firstname lastname")
    .populate("completed_by", "first_name last_name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getMeetingActionItems(
  filters?: MeetingActionItemFilters
): Promise<MeetingActionItem[]> {
  await connectDB();

  const appSettings = await getAppSettings();
  const tz = appSettings.timezone;
  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.meeting_id) {
    query.meeting_id = filters.meeting_id;
  }

  if (filters?.assigned_to) {
    query.assigned_to = filters.assigned_to;
  }

  if (filters?.priority) {
    query.priority = filters.priority;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.due_date_from || filters?.due_date_to) {
    const dateRange: Record<string, Date> = {};
    if (filters.due_date_from) {
      dateRange.$gte = startOfDayInTimezone(new Date(filters.due_date_from), tz);
    }
    if (filters.due_date_to) {
      dateRange.$lte = endOfDayInTimezone(new Date(filters.due_date_to), tz);
    }
    query.due_date = dateRange;
  }

  const items = await applyPopulates(
    MeetingActionItemModel.find(query).sort({ created_at: -1 })
  ).lean();

  return items.map((d: Record<string, unknown>) => toMeetingActionItem(d));
}

export async function getMeetingActionItemById(
  id: string
): Promise<MeetingActionItem | null> {
  await connectDB();

  const item = await applyPopulates(MeetingActionItemModel.findById(id)).lean();

  if (!item) return null;

  return toMeetingActionItem(item as unknown as Record<string, unknown>);
}

export async function createMeetingActionItem(
  data: CreateMeetingActionItemInput
): Promise<MeetingActionItem> {
  await connectDB();

  const item = await MeetingActionItemModel.create({
    meeting_id: data.meeting_id,
    title: data.title,
    description: data.description || null,
    assigned_to: data.assigned_to || null,
    due_date: data.due_date || null,
    priority: data.priority || "Medium",
    status: "Pending",
  });

  const created = await applyPopulates(
    MeetingActionItemModel.findById(item._id)
  ).lean();

  if (!created) throw new Error("Failed to create action item");

  return toMeetingActionItem(created as unknown as Record<string, unknown>);
}

export async function updateMeetingActionItem(
  id: string,
  data: UpdateMeetingActionItemInput
): Promise<MeetingActionItem> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.meeting_id !== undefined) updateData.meeting_id = data.meeting_id;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to || null;
  if (data.due_date !== undefined) updateData.due_date = data.due_date || null;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "Completed") {
      updateData.completed_at = new Date();
    }
  }
  updateData.updated_at = new Date();

  const item = await applyPopulates(
    MeetingActionItemModel.findByIdAndUpdate(id, updateData, { new: true })
  ).lean();

  if (!item) throw new Error("Action item not found");

  return toMeetingActionItem(item as unknown as Record<string, unknown>);
}

export async function deleteMeetingActionItem(
  id: string,
  reason?: string
): Promise<void> {
  await connectDB();

  await MeetingActionItemModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreMeetingActionItem(id: string): Promise<void> {
  await connectDB();

  await MeetingActionItemModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Pending",
    updated_at: new Date(),
  });
}
