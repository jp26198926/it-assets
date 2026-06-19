import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as departmentService from "@/lib/services/department-service";
import type { DepartmentFilters } from "@/lib/types/department";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: DepartmentFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("code")) filters.code = searchParams.get("code")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("description")) filters.description = searchParams.get("description")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const departments = await departmentService.getDepartments(hasFilters ? filters : undefined);
    return apiSuccess(departments);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch departments");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.code || typeof body.code !== "string") {
      return apiError("code is required", 400);
    }

    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const department = await departmentService.createDepartment({
      code: body.code,
      name: body.name,
      description: body.description,
    });

    return apiSuccess(department, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create department");
  }
}
