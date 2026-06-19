import { cookies } from "next/headers";
import { apiSuccess } from "@/lib/services/api-helpers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");

  return apiSuccess({ message: "Logged out successfully" });
}