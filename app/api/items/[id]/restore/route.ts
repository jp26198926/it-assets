import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as itemService from "@/lib/services/item-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/items", "Restore");
    if (error) return error;

    const { id } = await params;
    await itemService.restoreItem(id);
    return apiSuccess({ message: "Item restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore item");
  }
}
