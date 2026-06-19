import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as departmentService from "@/lib/services/department-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const department = await departmentService.getDepartmentById(id);
    if (!department) return apiError("Department not found", 404);
    return apiSuccess(department);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch department");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const department = await departmentService.updateDepartment(id, {
      code: body.code,
      name: body.name,
      description: body.description,
    });

    return apiSuccess(department);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update department");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await departmentService.deleteDepartment(id, reason);
    return apiSuccess({ message: "Department deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete department");
  }
}
