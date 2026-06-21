import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as employeeService from "@/lib/services/employee-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/employees", "Access");
    if (error) return error;

    const { id } = await params;
    const employee = await employeeService.getEmployeeById(id);
    if (!employee) return apiError("Employee not found", 404);
    return apiSuccess(employee);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch employee");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/employees", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const employee = await employeeService.updateEmployee(id, {
      emp_no: body.emp_no,
      firstname: body.firstname,
      middlename: body.middlename,
      lastname: body.lastname,
      email: body.email,
      contact_no: body.contact_no,
      department_id: body.department_id,
    });

    return apiSuccess(employee);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update employee");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/employees", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await employeeService.deleteEmployee(id, reason);
    return apiSuccess({ message: "Employee deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete employee");
  }
}
