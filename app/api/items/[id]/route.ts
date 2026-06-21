import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as itemService from "@/lib/services/item-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/items", "Access");
    if (error) return error;

    const { id } = await params;
    const item = await itemService.getItemById(id);
    if (!item) return apiError("Item not found", 404);
    return apiSuccess(item);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch item");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/items", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const item = await itemService.updateItem(id, {
      name: body.name,
      category_id: body.category_id,
      brand: body.brand,
      model: body.model,
      description: body.description,
      uom_id: body.uom_id,
      minimum_stock: body.minimum_stock,
      image_url: body.image_url,
    });
    return apiSuccess(item);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update item");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/items", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await itemService.deleteItem(id, reason);
    return apiSuccess({ message: "Item deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete item");
  }
}
