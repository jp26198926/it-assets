"use server";

import * as meetingTypeService from "@/lib/services/meeting-type-service";
import type {
  CreateMeetingTypeInput,
  UpdateMeetingTypeInput,
  MeetingTypeFilters,
  MeetingType,
  MeetingTypeSelectOption,
} from "@/lib/types/meeting-type";

export async function getMeetingTypes(
  filters?: MeetingTypeFilters
): Promise<MeetingType[]> {
  return meetingTypeService.getMeetingTypes(filters);
}

export async function getMeetingTypeById(id: string): Promise<MeetingType | null> {
  return meetingTypeService.getMeetingTypeById(id);
}

export async function createMeetingType(
  data: CreateMeetingTypeInput
): Promise<MeetingType> {
  return meetingTypeService.createMeetingType(data);
}

export async function updateMeetingType(
  id: string,
  data: UpdateMeetingTypeInput
): Promise<MeetingType> {
  return meetingTypeService.updateMeetingType(id, data);
}

export async function deleteMeetingType(id: string, reason?: string): Promise<void> {
  return meetingTypeService.deleteMeetingType(id, reason);
}

export async function restoreMeetingType(id: string): Promise<void> {
  return meetingTypeService.restoreMeetingType(id);
}

export async function getMeetingTypeSelectOptions(): Promise<MeetingTypeSelectOption[]> {
  return meetingTypeService.getMeetingTypeSelectOptions();
}
