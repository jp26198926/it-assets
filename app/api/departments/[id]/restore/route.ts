import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as departmentService from "@/lib/services/department-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await departmentService.restoreDepartment(id);
    return apiSuccess({ message: "Department restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore department");
  }
}
