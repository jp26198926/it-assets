import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as employeeService from "@/lib/services/employee-service";
import type { EmployeeFilters } from "@/lib/types/employee";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/employees", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: EmployeeFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("emp_no")) filters.emp_no = searchParams.get("emp_no")!;
    if (searchParams.get("firstname")) filters.firstname = searchParams.get("firstname")!;
    if (searchParams.get("middlename")) filters.middlename = searchParams.get("middlename")!;
    if (searchParams.get("lastname")) filters.lastname = searchParams.get("lastname")!;
    if (searchParams.get("email")) filters.email = searchParams.get("email")!;
    if (searchParams.get("contact_no")) filters.contact_no = searchParams.get("contact_no")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const employees = await employeeService.getEmployees(hasFilters ? filters : undefined);
    return apiSuccess(employees);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch employees");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/employees", "Add");
    if (error) return error;

    const body = await request.json();

    if (!body.firstname || typeof body.firstname !== "string") {
      return apiError("firstname is required", 400);
    }

    if (!body.lastname || typeof body.lastname !== "string") {
      return apiError("lastname is required", 400);
    }

    const employee = await employeeService.createEmployee({
      emp_no: body.emp_no,
      firstname: body.firstname,
      middlename: body.middlename,
      lastname: body.lastname,
      email: body.email,
      contact_no: body.contact_no,
      department_id: body.department_id,
    });

    return apiSuccess(employee, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create employee");
  }
}
