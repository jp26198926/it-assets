import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as pageService from "@/lib/services/page-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pageService.restorePage(id);
    return apiSuccess({ message: "Page restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore page");
  }
}
