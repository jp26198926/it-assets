import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as categoryService from "@/lib/services/category-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/categories", "Access");
    if (error) return error;

    const { id } = await params;
    const category = await categoryService.getCategoryById(id);
    if (!category) return apiError("Category not found", 404);
    return apiSuccess(category);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch category");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/categories", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    if (body.type && !["Inventoriable", "Consumable"].includes(body.type)) {
      return apiError("type must be 'Inventoriable' or 'Consumable'", 400);
    }

    const category = await categoryService.updateCategory(id, {
      name: body.name,
      type: body.type,
      description: body.description,
    });
    return apiSuccess(category);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update category");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/categories", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await categoryService.deleteCategory(id, reason);
    return apiSuccess({ message: "Category deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete category");
  }
}
