import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as categoryService from "@/lib/services/category-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/categories", "Restore");
    if (error) return error;

    const { id } = await params;
    await categoryService.restoreCategory(id);
    return apiSuccess({ message: "Category restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore category");
  }
}
