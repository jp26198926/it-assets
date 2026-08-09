import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as conversionService from "@/lib/services/conversion-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/conversions", "Access");
    if (error) return error;

    const { id } = await params;
    const conversion = await conversionService.getConversionById(id);
    if (!conversion) return apiError("Conversion not found", 404);
    return apiSuccess(conversion);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch conversion");
  }
}
