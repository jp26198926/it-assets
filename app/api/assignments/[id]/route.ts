import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as assignmentService from "@/lib/services/assignment-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/assignments", "Access");
    if (error) return error;

    const { id } = await params;
    const assignment = await assignmentService.getAssignmentById(id);
    if (!assignment) return apiError("Assignment not found", 404);
    return apiSuccess(assignment);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch assignment");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/assignments", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const assignment = await assignmentService.updateAssignment(id, {
      asset_id: body.asset_id,
      employee_id: body.employee_id,
      department_id: body.department_id,
      location_id: body.location_id,
      assigned_date: body.assigned_date,
      returned_date: body.returned_date,
      condition_on_issue: body.condition_on_issue,
      condition_on_return: body.condition_on_return,
      remarks: body.remarks,
      status: body.status,
    });

    return apiSuccess(assignment);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update assignment");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/assignments", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await assignmentService.deleteAssignment(id, reason);
    return apiSuccess({ message: "Assignment deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete assignment");
  }
}
