import { connectDB, disconnectDB } from "./connection";
import { Role } from "./models/role";

async function seedRoles() {
  await Role.findOneAndUpdate(
    { name: "Viewer" },
    {
      $setOnInsert: {
        name: "Viewer",
        description: "Default viewer role with read-only access",
        status: "Active",
        created_at: new Date(),
      },
    },
    { upsert: true }
  );
  console.log('✓ Role "Viewer" seeded');
}

async function seed() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected.\n");

    console.log("Seeding default roles...");
    await seedRoles();

    console.log("\n✓ Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

seed();
