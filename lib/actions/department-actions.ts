"use server";

import * as departmentService from "@/lib/services/department-service";
import type { CreateDepartmentInput, UpdateDepartmentInput, DepartmentFilters, Department } from "@/lib/types/department";

export async function getDepartments(filters?: DepartmentFilters): Promise<Department[]> {
  return departmentService.getDepartments(filters);
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  return departmentService.getDepartmentById(id);
}

export async function createDepartment(data: CreateDepartmentInput): Promise<Department> {
  return departmentService.createDepartment(data);
}

export async function updateDepartment(id: string, data: UpdateDepartmentInput): Promise<Department> {
  return departmentService.updateDepartment(id, data);
}

export async function deleteDepartment(id: string, reason?: string): Promise<void> {
  return departmentService.deleteDepartment(id, reason);
}

export async function restoreDepartment(id: string): Promise<void> {
  return departmentService.restoreDepartment(id);
}
