"use server";

import * as meetingActionItemService from "@/lib/services/meeting-action-item-service";
import type {
  CreateMeetingActionItemInput,
  UpdateMeetingActionItemInput,
  MeetingActionItemFilters,
  MeetingActionItem,
} from "@/lib/types/meeting-action-item";

export async function getMeetingActionItems(
  filters?: MeetingActionItemFilters
): Promise<MeetingActionItem[]> {
  return meetingActionItemService.getMeetingActionItems(filters);
}

export async function getMeetingActionItemById(
  id: string
): Promise<MeetingActionItem | null> {
  return meetingActionItemService.getMeetingActionItemById(id);
}

export async function createMeetingActionItem(
  data: CreateMeetingActionItemInput
): Promise<MeetingActionItem> {
  return meetingActionItemService.createMeetingActionItem(data);
}

export async function updateMeetingActionItem(
  id: string,
  data: UpdateMeetingActionItemInput
): Promise<MeetingActionItem> {
  return meetingActionItemService.updateMeetingActionItem(id, data);
}

export async function deleteMeetingActionItem(
  id: string,
  reason?: string
): Promise<void> {
  return meetingActionItemService.deleteMeetingActionItem(id, reason);
}

export async function restoreMeetingActionItem(id: string): Promise<void> {
  return meetingActionItemService.restoreMeetingActionItem(id);
}
