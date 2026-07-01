import { connectDB, disconnectDB } from "../lib/db/connection";
import { Timezone } from "../lib/db/models/timezone";

function formatOffset(seconds: number): string {
  const sign = seconds >= 0 ? "+" : "-";
  const abs = Math.abs(seconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  return `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

async function seedTimezones() {
  const timezones = Intl.supportedValuesOf("timeZone");

  // Use a fixed reference date so offsets are consistent across runs
  const refDate = new Date("2025-01-01T00:00:00Z");

  let count = 0;

  for (const tz of timezones) {
    try {
      // Compute UTC offset for this timezone at the reference date
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      });
      const parts = formatter.formatToParts(refDate);
      const offsetPart = parts.find((p) => p.type === "timeZoneName");
      // shortOffset gives e.g. "GMT+8" or "GMT-5" or "GMT"
      let offsetStr = "UTC+00:00";
      if (offsetPart) {
        const val = offsetPart.value; // "GMT", "GMT+8", "GMT-5:30"
        const m = val.match(/GMT([+-]\d{1,2}(?::\d{2})?)?/);
        if (m) {
          if (m[1]) {
            // Has offset like +8 or -5:30
            let parts2 = m[1].split(":");
            let hours = parseInt(parts2[0]);
            let mins = parts2[1] ? parseInt(parts2[1]) : 0;
            const totalSecs = (hours * 3600) + (mins * 60 * Math.sign(hours));
            offsetStr = formatOffset(totalSecs);
          } else {
            offsetStr = "UTC+00:00";
          }
        }
      }

      const displayName = `${tz} (${offsetStr})`;

      await Timezone.findOneAndUpdate(
        { name: tz },
        {
          $setOnInsert: {
            name: tz,
            display_name: displayName,
            status: "Active",
            created_at: new Date(),
          },
        },
        { upsert: true }
      );
      count++;
    } catch (e) {
      console.error(`Failed to seed timezone ${tz}:`, e);
    }
  }

  console.log(`✓ ${count} timezones seeded`);
}

async function seed() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected.\n");

    console.log("Seeding timezones...");
    await seedTimezones();

    console.log("\n✓ Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

seed();
