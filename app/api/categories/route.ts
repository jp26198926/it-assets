import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as categoryService from "@/lib/services/category-service";
import type { CategoryFilters } from "@/lib/types/category";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/categories", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: CategoryFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("type")) filters.type = searchParams.get("type")!;
    if (searchParams.get("description")) filters.description = searchParams.get("description")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const categories = await categoryService.getCategories(hasFilters ? filters : undefined);
    return apiSuccess(categories);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch categories");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/categories", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }
    if (!body.type || !["Inventoriable", "Consumable"].includes(body.type)) {
      return apiError("type must be 'Inventoriable' or 'Consumable'", 400);
    }

    const category = await categoryService.createCategory({
      name: body.name,
      type: body.type,
      description: body.description,
    });
    return apiSuccess(category, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create category");
  }
}
