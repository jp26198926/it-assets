"use server";

import * as assignmentService from "@/lib/services/assignment-service";
import { getAuthFromRequest } from "@/lib/services/api-auth";
import type { CreateAssignmentInput, UpdateAssignmentInput, ReturnAssignmentInput, MarkAsLostInput, AssignmentFilters, Assignment } from "@/lib/types/assignment";

export async function getAssignmentSelectOptions(currentAssetId?: string): Promise<{
  assets: { id: string; barcode: string; itemName: string }[];
  employees: { id: string; name: string; departmentId: string | null }[];
  departments: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}> {
  return assignmentService.getAssignmentSelectOptions(currentAssetId);
}

export async function getAssignments(filters?: AssignmentFilters): Promise<Assignment[]> {
  return assignmentService.getAssignments(filters);
}

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  return assignmentService.getAssignmentById(id);
}

export async function createAssignment(data: CreateAssignmentInput): Promise<Assignment> {
  const user = await getAuthFromRequest();
  return assignmentService.createAssignment({
    ...data,
    created_by: user?.userId || null,
  });
}

export async function updateAssignment(id: string, data: UpdateAssignmentInput): Promise<Assignment> {
  const user = await getAuthFromRequest();
  return assignmentService.updateAssignment(id, {
    ...data,
    updated_by: user?.userId || null,
  });
}

export async function returnAssignment(id: string, data: ReturnAssignmentInput): Promise<Assignment> {
  const user = await getAuthFromRequest();
  return assignmentService.returnAssignment(id, data, user?.userId || null);
}

export async function markAsLost(id: string, data: MarkAsLostInput): Promise<Assignment> {
  const user = await getAuthFromRequest();
  return assignmentService.markAsLost(id, data, user?.userId || null);
}

export async function deleteAssignment(id: string, reason?: string): Promise<void> {
  return assignmentService.deleteAssignment(id, reason);
}

export async function restoreAssignment(id: string): Promise<void> {
  return assignmentService.restoreAssignment(id);
}
