import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as uomService from "@/lib/services/uom-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/uoms", "Restore");
    if (error) return error;

    const { id } = await params;
    await uomService.restoreUOM(id);
    return apiSuccess({ message: "UOM restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore UOM");
  }
}
