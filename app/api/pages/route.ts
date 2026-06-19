import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as pageService from "@/lib/services/page-service";
import type { PageFilters } from "@/lib/types/page";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: PageFilters = {};

    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("path")) filters.path = searchParams.get("path")!;
    if (searchParams.get("description")) filters.description = searchParams.get("description")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("section")) filters.section = searchParams.get("section")!;
    if (searchParams.get("parent_id")) filters.parent_id = searchParams.get("parent_id")!;

    const hasFilters = Object.keys(filters).length > 0;
    const pages = await pageService.getPages(hasFilters ? filters : undefined);
    return apiSuccess(pages);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch pages");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }
    if (!body.path || typeof body.path !== "string") {
      return apiError("path is required", 400);
    }
    if (!body.icon || typeof body.icon !== "string") {
      return apiError("icon is required", 400);
    }

    const page = await pageService.createPage({
      name: body.name,
      path: body.path,
      icon: body.icon,
      description: body.description,
      parent_id: body.parent_id,
      section: body.section,
      order: body.order,
    });

    return apiSuccess(page, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create page");
  }
}
