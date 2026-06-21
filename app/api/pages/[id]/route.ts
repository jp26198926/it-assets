import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as pageService from "@/lib/services/page-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/pages", "Access");
    if (error) return error;

    const { id } = await params;
    const page = await pageService.getPageById(id);
    if (!page) return apiError("Page not found", 404);
    return apiSuccess(page);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch page");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/pages", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const page = await pageService.updatePage(id, {
      name: body.name,
      description: body.description,
      path: body.path,
      icon: body.icon,
      parent_id: body.parent_id,
      section: body.section,
      order: body.order,
    });

    return apiSuccess(page);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update page");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/pages", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await pageService.deletePage(id, reason);
    return apiSuccess({ message: "Page deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete page");
  }
}
