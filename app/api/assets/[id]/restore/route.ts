import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as assetService from "@/lib/services/asset-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/assets", "Restore");
    if (error) return error;

    const { id } = await params;
    await assetService.restoreAsset(id);
    return apiSuccess({ message: "Asset restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore asset");
  }
}
