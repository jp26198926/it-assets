import { connectDB, disconnectDB } from "./connection";
import { DepartmentStatus } from "./models/department-status";
import { RoleStatus } from "./models/role-status";
import { PageStatus } from "./models/page-status";
import { PermissionStatus } from "./models/permission-status";
import { RolePermissionStatus } from "./models/role-permission-status";
import { UserStatus } from "./models/user-status";
import { Role } from "./models/role";

async function seedStatuses() {
  const statusSeeds = [
    { model: DepartmentStatus, name: "DepartmentStatus", data: [{ status: "Deleted" }, { status: "Active" }] },
    { model: RoleStatus, name: "RoleStatus", data: [{ status: "Deleted" }, { status: "Active" }] },
    { model: PageStatus, name: "PageStatus", data: [{ status: "Deleted" }, { status: "Active" }] },
    { model: PermissionStatus, name: "PermissionStatus", data: [{ status: "Deleted" }, { status: "Active" }] },
    { model: RolePermissionStatus, name: "RolePermissionStatus", data: [{ status: "Deleted" }, { status: "Active" }] },
    { model: UserStatus, name: "UserStatus", data: [{ status: "Deleted" }, { status: "Inactive" }, { status: "Active" }] },
  ];

  for (const seed of statusSeeds) {
    for (const item of seed.data) {
      await seed.model.findOneAndUpdate(
        { status: item.status },
        { $setOnInsert: item },
        { upsert: true }
      );
    }
    console.log(`✓ ${seed.name} seeded`);
  }
}

async function seedRoles() {
  const activeStatus = await RoleStatus.findOne({ status: "Active" });
  if (!activeStatus) {
    throw new Error("RoleStatus 'Active' not found. Run status seeds first.");
  }

  await Role.findOneAndUpdate(
    { name: "Viewer" },
    {
      $setOnInsert: {
        name: "Viewer",
        description: "Default viewer role with read-only access",
        status_id: activeStatus._id,
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

    console.log("Seeding status collections...");
    await seedStatuses();

    console.log("\nSeeding default roles...");
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
