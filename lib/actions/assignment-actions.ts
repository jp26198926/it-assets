"use server";

import * as assignmentService from "@/lib/services/assignment-service";
import type { CreateAssignmentInput, UpdateAssignmentInput, AssignmentFilters, Assignment } from "@/lib/types/assignment";

export async function getAssignmentSelectOptions(): Promise<{
  assets: { id: string; barcode: string; itemName: string }[];
  employees: { id: string; name: string; departmentId: string | null }[];
  departments: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}> {
  return assignmentService.getAssignmentSelectOptions();
}

export async function getAssignments(filters?: AssignmentFilters): Promise<Assignment[]> {
  return assignmentService.getAssignments(filters);
}

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  return assignmentService.getAssignmentById(id);
}

export async function createAssignment(data: CreateAssignmentInput): Promise<Assignment> {
  return assignmentService.createAssignment(data);
}

export async function updateAssignment(id: string, data: UpdateAssignmentInput): Promise<Assignment> {
  return assignmentService.updateAssignment(id, data);
}

export async function deleteAssignment(id: string, reason?: string): Promise<void> {
  return assignmentService.deleteAssignment(id, reason);
}

export async function restoreAssignment(id: string): Promise<void> {
  return assignmentService.restoreAssignment(id);
}
