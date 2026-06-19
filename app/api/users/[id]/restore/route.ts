import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/services/api-helpers";
import * as userService from "@/lib/services/user-service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await userService.restoreUser(id);
    return apiSuccess({ message: "User restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore user");
  }
}
