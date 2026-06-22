import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as itemService from "@/lib/services/item-service";
import type { ItemFilters } from "@/lib/types/item";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/items", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: ItemFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("item_code")) filters.item_code = searchParams.get("item_code")!;
    if (searchParams.get("category_id")) filters.category_id = searchParams.get("category_id")!;
    if (searchParams.get("brand")) filters.brand = searchParams.get("brand")!;
    if (searchParams.get("model")) filters.model = searchParams.get("model")!;
    if (searchParams.get("uom_id")) filters.uom_id = searchParams.get("uom_id")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const items = await itemService.getItems(hasFilters ? filters : undefined);
    return apiSuccess(items);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch items");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { auth, error } = await withPageAuth("/items", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const item = await itemService.createItem({
      name: body.name,
      category_id: body.category_id,
      brand: body.brand,
      model: body.model,
      description: body.description,
      uom_id: body.uom_id,
      minimum_stock: body.minimum_stock,
      image_url: body.image_url,
      created_by: auth.user?.userId || null,
    });
    return apiSuccess(item, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create item");
  }
}
