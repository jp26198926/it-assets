import { connectDB } from "@/lib/db/connection";
import { Meeting as MeetingModel } from "@/lib/db/models/meeting";
import { MeetingType as MeetingTypeModel } from "@/lib/db/models/meeting-type";
import { Employee as EmployeeModel } from "@/lib/db/models/employee";
import { Counter as CounterModel } from "@/lib/db/models/counter";
import { getAppSettings } from "./application-service";
import { startOfDayInTimezone, endOfDayInTimezone } from "@/lib/utils/timezone";
import type {
  CreateMeetingInput,
  UpdateMeetingInput,
  MeetingFilters,
  Meeting,
  MeetingTypeSelectOption,
  AgendaItem,
  Attendee,
} from "@/lib/types/meeting";

function toAgendaItem(item: Record<string, unknown>): AgendaItem {
  return {
    id: (item._id as { toString(): string }).toString(),
    topic: item.topic as string,
    description: (item.description as string) ?? null,
    presenter: (item.presenter as string) ?? null,
    duration_minutes: (item.duration_minutes as number) ?? null,
    notes: (item.notes as string) ?? null,
  };
}

function toAttendee(att: Record<string, unknown>): Attendee {
  const employeeVal = att.employee_id as unknown as
    | { _id: { toString(): string }; firstname: string; lastname: string }
    | string;

  let employee_id: string;
  let employee_name: string | undefined;

  if (typeof employeeVal === "string") {
    employee_id = employeeVal;
  } else {
    employee_id = employeeVal._id.toString();
    employee_name = `${employeeVal.firstname} ${employeeVal.lastname}`.trim();
  }

  return {
    id: (att._id as { toString(): string }).toString(),
    employee_id,
    employee_name,
    attendance_status: att.attendance_status as Attendee["attendance_status"],
    notes: (att.notes as string) ?? null,
  };
}

function toMeeting(d: Record<string, unknown>): Meeting {
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

  const meetingTypeVal = d.meeting_type_id as unknown as
    | { _id: { toString(): string }; name: string; color: string | null }
    | string
    | null;
  let meeting_type_id: string | null = null;
  let meeting_type_name: string | undefined;
  let meeting_type_color: string | undefined;
  if (meetingTypeVal && typeof meetingTypeVal === "object" && "_id" in meetingTypeVal) {
    meeting_type_id = meetingTypeVal._id.toString();
    meeting_type_name = meetingTypeVal.name;
    meeting_type_color = meetingTypeVal.color ?? undefined;
  } else if (typeof meetingTypeVal === "string") {
    meeting_type_id = meetingTypeVal;
  }

  const parentMeetingVal = d.parent_meeting_id as unknown as string | null;
  const parent_meeting_id = parentMeetingVal ?? null;

  const agendaItems = Array.isArray(d.agenda_items)
    ? (d.agenda_items as Record<string, unknown>[]).map(toAgendaItem)
    : [];

  const attendees = Array.isArray(d.attendees)
    ? (d.attendees as Record<string, unknown>[]).map(toAttendee)
    : [];

  const recurrence = d.recurrence as Meeting["recurrence"];

  return {
    id: (d._id as { toString(): string }).toString(),
    meeting_no: d.meeting_no as number,
    title: d.title as string,
    description: (d.description as string) ?? null,
    meeting_type_id,
    meeting_type_name,
    meeting_type_color,
    scheduled_date: d.scheduled_date as Date,
    start_time: d.start_time as string,
    end_time: (d.end_time as string) ?? null,
    location: (d.location as string) ?? null,
    meeting_link: (d.meeting_link as string) ?? null,
    platform: (d.platform as string) ?? null,
    status: d.status as Meeting["status"],
    notes: (d.notes as string) ?? null,
    agenda_items: agendaItems,
    attendees,
    attachments: (d.attachments as string[]) ?? [],
    is_recurring: (d.is_recurring as boolean) ?? false,
    recurrence,
    parent_meeting_id,
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

function applyPopulates(query: ReturnType<typeof MeetingModel.find> | ReturnType<typeof MeetingModel.findById>) {
  return query
    .populate("meeting_type_id", "name color")
    .populate("parent_meeting_id", "title meeting_no")
    .populate("attendees.employee_id", "firstname lastname")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

async function generateMeetingNo(): Promise<number> {
  await connectDB();

  const counter = await CounterModel.findOneAndUpdate(
    { name: "meeting_no" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  return (counter as unknown as { seq: number }).seq;
}

export async function getMeetings(
  filters?: MeetingFilters
): Promise<Meeting[]> {
  await connectDB();

  const appSettings = await getAppSettings();
  const tz = appSettings.timezone;
  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { location: { $regex: filters.search, $options: "i" } },
      { notes: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.title) {
    query.title = { $regex: filters.title, $options: "i" };
  }

  if (filters?.meeting_type_id) {
    query.meeting_type_id = filters.meeting_type_id;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.location) {
    query.location = { $regex: filters.location, $options: "i" };
  }

  if (filters?.scheduled_date_from || filters?.scheduled_date_to) {
    const dateRange: Record<string, Date> = {};
    if (filters.scheduled_date_from) {
      dateRange.$gte = startOfDayInTimezone(new Date(filters.scheduled_date_from), tz);
    }
    if (filters.scheduled_date_to) {
      dateRange.$lte = endOfDayInTimezone(new Date(filters.scheduled_date_to), tz);
    }
    query.scheduled_date = dateRange;
  }

  if (filters?.attendee_employee_id) {
    query["attendees.employee_id"] = filters.attendee_employee_id;
  }

  const meetings = await applyPopulates(
    MeetingModel.find(query).sort({ scheduled_date: -1 })
  ).lean();

  return meetings.map((d: Record<string, unknown>) => toMeeting(d));
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  await connectDB();

  const meeting = await applyPopulates(MeetingModel.findById(id)).lean();

  if (!meeting) return null;

  return toMeeting(meeting as unknown as Record<string, unknown>);
}

export async function createMeeting(data: CreateMeetingInput): Promise<Meeting> {
  await connectDB();

  const meeting_no = await generateMeetingNo();

  const meeting = await MeetingModel.create({
    meeting_no,
    title: data.title,
    description: data.description || null,
    meeting_type_id: data.meeting_type_id || null,
    scheduled_date: data.scheduled_date,
    start_time: data.start_time,
    end_time: data.end_time || null,
    location: data.location || null,
    meeting_link: data.meeting_link || null,
    platform: data.platform || null,
    notes: data.notes || null,
    agenda_items: data.agenda_items || [],
    attendees: data.attendees || [],
    attachments: data.attachments || [],
    is_recurring: data.is_recurring || false,
    recurrence: data.recurrence || null,
    parent_meeting_id: null,
    status: "Scheduled",
  });

  const created = await applyPopulates(MeetingModel.findById(meeting._id)).lean();

  if (!created) throw new Error("Failed to create meeting");

  return toMeeting(created as unknown as Record<string, unknown>);
}

export async function updateMeeting(
  id: string,
  data: UpdateMeetingInput
): Promise<Meeting> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.meeting_type_id !== undefined) updateData.meeting_type_id = data.meeting_type_id || null;
  if (data.scheduled_date !== undefined) updateData.scheduled_date = data.scheduled_date;
  if (data.start_time !== undefined) updateData.start_time = data.start_time;
  if (data.end_time !== undefined) updateData.end_time = data.end_time || null;
  if (data.location !== undefined) updateData.location = data.location || null;
  if (data.meeting_link !== undefined) updateData.meeting_link = data.meeting_link || null;
  if (data.platform !== undefined) updateData.platform = data.platform || null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.agenda_items !== undefined) updateData.agenda_items = data.agenda_items;
  if (data.attendees !== undefined) updateData.attendees = data.attendees;
  if (data.attachments !== undefined) updateData.attachments = data.attachments;
  if (data.is_recurring !== undefined) updateData.is_recurring = data.is_recurring;
  if (data.recurrence !== undefined) updateData.recurrence = data.recurrence;
  updateData.updated_at = new Date();

  const meeting = await applyPopulates(
    MeetingModel.findByIdAndUpdate(id, updateData, { new: true })
  ).lean();

  if (!meeting) throw new Error("Meeting not found");

  return toMeeting(meeting as unknown as Record<string, unknown>);
}

export async function deleteMeeting(id: string, reason?: string): Promise<void> {
  await connectDB();

  await MeetingModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreMeeting(id: string): Promise<void> {
  await connectDB();

  await MeetingModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Scheduled",
    updated_at: new Date(),
  });
}

export async function addAgendaItem(
  meetingId: string,
  item: Omit<AgendaItem, "id">
): Promise<Meeting> {
  await connectDB();

  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) throw new Error("Meeting not found");

  meeting.agenda_items.push(item as never);
  meeting.updated_at = new Date();
  await meeting.save();

  const updated = await applyPopulates(MeetingModel.findById(meetingId)).lean();
  if (!updated) throw new Error("Failed to add agenda item");

  return toMeeting(updated as unknown as Record<string, unknown>);
}

export async function updateAgendaItem(
  meetingId: string,
  itemId: string,
  data: Partial<Omit<AgendaItem, "id">>
): Promise<Meeting> {
  await connectDB();

  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) throw new Error("Meeting not found");

  const item = meeting.agenda_items.id(itemId);
  if (!item) throw new Error("Agenda item not found");

  if (data.topic !== undefined) item.topic = data.topic;
  if (data.description !== undefined) item.description = data.description;
  if (data.presenter !== undefined) item.presenter = data.presenter;
  if (data.duration_minutes !== undefined) item.duration_minutes = data.duration_minutes;
  if (data.notes !== undefined) item.notes = data.notes;

  meeting.updated_at = new Date();
  await meeting.save();

  const updated = await applyPopulates(MeetingModel.findById(meetingId)).lean();
  if (!updated) throw new Error("Failed to update agenda item");

  return toMeeting(updated as unknown as Record<string, unknown>);
}

export async function removeAgendaItem(
  meetingId: string,
  itemId: string
): Promise<Meeting> {
  await connectDB();

  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) throw new Error("Meeting not found");

  meeting.agenda_items.pull({ _id: itemId } as never);
  meeting.updated_at = new Date();
  await meeting.save();

  const updated = await applyPopulates(MeetingModel.findById(meetingId)).lean();
  if (!updated) throw new Error("Failed to remove agenda item");

  return toMeeting(updated as unknown as Record<string, unknown>);
}

export async function addAttendee(
  meetingId: string,
  attendee: Omit<Attendee, "id" | "employee_name">
): Promise<Meeting> {
  await connectDB();

  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) throw new Error("Meeting not found");

  meeting.attendees.push(attendee as never);
  meeting.updated_at = new Date();
  await meeting.save();

  const updated = await applyPopulates(MeetingModel.findById(meetingId)).lean();
  if (!updated) throw new Error("Failed to add attendee");

  return toMeeting(updated as unknown as Record<string, unknown>);
}

export async function removeAttendee(
  meetingId: string,
  attendeeId: string
): Promise<Meeting> {
  await connectDB();

  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) throw new Error("Meeting not found");

  meeting.attendees.pull({ _id: attendeeId } as never);
  meeting.updated_at = new Date();
  await meeting.save();

  const updated = await applyPopulates(MeetingModel.findById(meetingId)).lean();
  if (!updated) throw new Error("Failed to remove attendee");

  return toMeeting(updated as unknown as Record<string, unknown>);
}

export async function updateAttendee(
  meetingId: string,
  attendeeId: string,
  data: Partial<Omit<Attendee, "id" | "employee_name">>
): Promise<Meeting> {
  await connectDB();

  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) throw new Error("Meeting not found");

  const attendee = meeting.attendees.id(attendeeId);
  if (!attendee) throw new Error("Attendee not found");

  if (data.employee_id !== undefined) attendee.employee_id = data.employee_id;
  if (data.attendance_status !== undefined) attendee.attendance_status = data.attendance_status;
  if (data.notes !== undefined) attendee.notes = data.notes;

  meeting.updated_at = new Date();
  await meeting.save();

  const updated = await applyPopulates(MeetingModel.findById(meetingId)).lean();
  if (!updated) throw new Error("Failed to update attendee");

  return toMeeting(updated as unknown as Record<string, unknown>);
}

export async function getMeetingTypeSelectOptions(): Promise<MeetingTypeSelectOption[]> {
  await connectDB();

  const meetingTypes = await MeetingTypeModel.find({ deleted_at: null })
    .sort({ name: 1 })
    .lean();

  return meetingTypes.map((mt) => ({
    id: (mt._id as { toString(): string }).toString(),
    name: mt.name,
    color: mt.color,
  }));
}
