import { connectDB } from "@/lib/db/connection";
import { Timezone as TimezoneModel } from "@/lib/db/models/timezone";
import type { TimezoneSelectOption } from "@/lib/types/timezone";

export async function getTimezoneSelectOptions(): Promise<TimezoneSelectOption[]> {
  await connectDB();

  const timezones = await TimezoneModel.find({ status: "Active" })
    .select("name display_name")
    .sort({ name: 1 })
    .lean();

  return timezones.map((tz) => ({
    id: tz.name,
    display_name: tz.display_name,
  }));
}
