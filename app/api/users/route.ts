import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as userService from "@/lib/services/user-service";
import type { UserFilters } from "@/lib/types/user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: UserFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("first_name")) filters.first_name = searchParams.get("first_name")!;
    if (searchParams.get("last_name")) filters.last_name = searchParams.get("last_name")!;
    if (searchParams.get("email")) filters.email = searchParams.get("email")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const users = await userService.getUsers(hasFilters ? filters : undefined);
    return apiSuccess(users);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch users");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.first_name || typeof body.first_name !== "string") {
      return apiError("first_name is required", 400);
    }

    if (!body.last_name || typeof body.last_name !== "string") {
      return apiError("last_name is required", 400);
    }

    if (!body.email || typeof body.email !== "string") {
      return apiError("email is required", 400);
    }

    if (!body.password || typeof body.password !== "string") {
      return apiError("password is required", 400);
    }

    if (!body.role_id || typeof body.role_id !== "string") {
      return apiError("role_id is required", 400);
    }

    const user = await userService.createUser({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: body.password,
      department_id: body.department_id,
      role_id: body.role_id,
    });

    return apiSuccess(user, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create user");
  }
}
