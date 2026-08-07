"use server";

import * as meetingService from "@/lib/services/meeting-service";
import type {
  CreateMeetingInput,
  UpdateMeetingInput,
  MeetingFilters,
  Meeting,
  AgendaItem,
  Attendee,
  MeetingTypeSelectOption,
} from "@/lib/types/meeting";

export async function getMeetings(filters?: MeetingFilters): Promise<Meeting[]> {
  return meetingService.getMeetings(filters);
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  return meetingService.getMeetingById(id);
}

export async function createMeeting(data: CreateMeetingInput): Promise<Meeting> {
  return meetingService.createMeeting(data);
}

export async function updateMeeting(
  id: string,
  data: UpdateMeetingInput
): Promise<Meeting> {
  return meetingService.updateMeeting(id, data);
}

export async function deleteMeeting(id: string, reason?: string): Promise<void> {
  return meetingService.deleteMeeting(id, reason);
}

export async function restoreMeeting(id: string): Promise<void> {
  return meetingService.restoreMeeting(id);
}

export async function addAgendaItem(
  meetingId: string,
  item: Omit<AgendaItem, "id">
): Promise<Meeting> {
  return meetingService.addAgendaItem(meetingId, item);
}

export async function updateAgendaItem(
  meetingId: string,
  itemId: string,
  data: Partial<Omit<AgendaItem, "id">>
): Promise<Meeting> {
  return meetingService.updateAgendaItem(meetingId, itemId, data);
}

export async function removeAgendaItem(
  meetingId: string,
  itemId: string
): Promise<Meeting> {
  return meetingService.removeAgendaItem(meetingId, itemId);
}

export async function addAttendee(
  meetingId: string,
  attendee: Omit<Attendee, "id" | "employee_name">
): Promise<Meeting> {
  return meetingService.addAttendee(meetingId, attendee);
}

export async function updateAttendee(
  meetingId: string,
  attendeeId: string,
  data: Partial<Omit<Attendee, "id" | "employee_name">>
): Promise<Meeting> {
  return meetingService.updateAttendee(meetingId, attendeeId, data);
}

export async function removeAttendee(
  meetingId: string,
  attendeeId: string
): Promise<Meeting> {
  return meetingService.removeAttendee(meetingId, attendeeId);
}

export async function getMeetingTypeSelectOptions(): Promise<MeetingTypeSelectOption[]> {
  return meetingService.getMeetingTypeSelectOptions();
}

export async function cloneMeeting(
  sourceId: string,
  overrides?: { scheduled_date?: Date; start_time?: string; end_time?: string }
): Promise<Meeting> {
  const source = await meetingService.getMeetingById(sourceId);
  if (!source) throw new Error("Source meeting not found");

  return meetingService.createMeeting({
    title: source.title,
    description: source.description || undefined,
    meeting_type_id: source.meeting_type_id || undefined,
    scheduled_date: overrides?.scheduled_date || new Date(source.scheduled_date),
    start_time: overrides?.start_time || source.start_time,
    end_time: overrides?.end_time ?? (source.end_time || undefined),
    location: source.location || undefined,
    meeting_link: source.meeting_link || undefined,
    platform: source.platform || undefined,
    agenda_items: source.agenda_items.map((a) => ({
      topic: a.topic,
      description: a.description,
      presenter: a.presenter,
      duration_minutes: a.duration_minutes,
      notes: a.notes,
    })),
    attendees: source.attendees.map((a) => ({
      employee_id: a.employee_id,
      attendance_status: "Pending" as const,
      notes: a.notes,
    })),
    attachments: [...source.attachments],
    is_recurring: source.is_recurring,
    recurrence: source.recurrence ? { ...source.recurrence } : null,
  });
}
