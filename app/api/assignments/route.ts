import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as assignmentService from "@/lib/services/assignment-service";
import type { AssignmentFilters } from "@/lib/types/assignment";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/assignments", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: AssignmentFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("asset_id")) filters.asset_id = searchParams.get("asset_id")!;
    if (searchParams.get("employee_id")) filters.employee_id = searchParams.get("employee_id")!;
    if (searchParams.get("department_id")) filters.department_id = searchParams.get("department_id")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const assignments = await assignmentService.getAssignments(hasFilters ? filters : undefined);
    return apiSuccess(assignments);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch assignments");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/assignments", "Add");
    if (error) return error;

    const body = await request.json();

    if (!body.asset_id) return apiError("asset_id is required", 400);
    if (!body.assigned_date) return apiError("assigned_date is required", 400);
    if (!body.condition_on_issue || typeof body.condition_on_issue !== "string") {
      return apiError("condition_on_issue is required", 400);
    }

    const assignment = await assignmentService.createAssignment({
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

    return apiSuccess(assignment, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create assignment");
  }
}
