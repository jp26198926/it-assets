import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as supplierService from "@/lib/services/supplier-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/suppliers", "Restore");
    if (error) return error;

    const { id } = await params;
    await supplierService.restoreSupplier(id);
    return apiSuccess({ message: "Supplier restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore supplier");
  }
}
