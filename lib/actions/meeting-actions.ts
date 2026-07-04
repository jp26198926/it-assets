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
