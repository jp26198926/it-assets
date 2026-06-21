import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as uomService from "@/lib/services/uom-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/uoms", "Access");
    if (error) return error;

    const { id } = await params;
    const uom = await uomService.getUOMById(id);
    if (!uom) return apiError("UOM not found", 404);
    return apiSuccess(uom);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch UOM");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/uoms", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const uom = await uomService.updateUOM(id, {
      code: body.code,
      name: body.name,
    });

    return apiSuccess(uom);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update UOM");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/uoms", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await uomService.deleteUOM(id, reason);
    return apiSuccess({ message: "UOM deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete UOM");
  }
}
