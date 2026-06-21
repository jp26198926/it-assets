"use server";

import * as employeeService from "@/lib/services/employee-service";
import type { CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters, Employee } from "@/lib/types/employee";

export async function getEmployeeSelectOptions(): Promise<{ departments: { id: string; name: string }[] }> {
  return employeeService.getEmployeeSelectOptions();
}

export async function getEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
  return employeeService.getEmployees(filters);
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  return employeeService.getEmployeeById(id);
}

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee> {
  return employeeService.createEmployee(data);
}

export async function updateEmployee(id: string, data: UpdateEmployeeInput): Promise<Employee> {
  return employeeService.updateEmployee(id, data);
}

export async function deleteEmployee(id: string, reason?: string): Promise<void> {
  return employeeService.deleteEmployee(id, reason);
}

export async function restoreEmployee(id: string): Promise<void> {
  return employeeService.restoreEmployee(id);
}
