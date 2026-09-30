import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { connectDB, disconnectDB } from "./connection";
import { Page } from "./models/page";
import { Permission } from "./models/permission";
import { Role } from "./models/role";
import { User } from "./models/user";
import { iconMap } from "../icon-map";
import {
  PERMISSIONS,
  PAGES,
  ROLES,
  TICKET_PAGE_PATHS,
  assertSeedData,
  type SeedPage,
} from "./seed-data";

function assertIcons(): void {
  for (const page of PAGES) {
    if (!(page.icon in iconMap)) {
      throw new Error(
        `Page "${page.name}" uses unknown icon "${page.icon}" — must be a key of lib/icon-map.ts`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Permissions → Map<name, _id>
// ---------------------------------------------------------------------------

async function seedPermissions(): Promise<Map<string, Types.ObjectId>> {
  const idByName = new Map<string, Types.ObjectId>();

  for (const perm of PERMISSIONS) {
    const doc = await Permission.findOneAndUpdate(
      { name: perm.name },
      {
        $setOnInsert: {
          name: perm.name,
          created_at: new Date(),
        },
        $set: {
          description: perm.description,
          status: "Active",
          deleted_at: null,
          deleted_by: null,
          deleted_reason: null,
        },
      },
      { upsert: true, new: true }
    );
    idByName.set(perm.name, doc._id as Types.ObjectId);
  }

  console.log(`✓ Permissions seeded (${PERMISSIONS.length})`);
  return idByName;
}

// ---------------------------------------------------------------------------
// Pages → Map<name, _id>  (two-phase parent_id resolution)
// ---------------------------------------------------------------------------

async function seedPages(): Promise<Map<string, Types.ObjectId>> {
  const idByName = new Map<string, Types.ObjectId>();

  // Phase 1: upsert every page with parent_id: null and record name → _id.
  for (const row of PAGES) {
    const doc = await Page.findOneAndUpdate(
      { name: row.name },
      {
        $setOnInsert: {
          name: row.name,
          created_at: new Date(),
        },
        $set: {
          description: row.description ?? null,
          path: row.path,
          icon: row.icon,
          section: row.section,
          order: row.order,
          status: "Active",
          deleted_at: null,
          deleted_by: null,
          deleted_reason: null,
          parent_id: null,
        },
      },
      { upsert: true, new: true }
    );
    idByName.set(row.name, doc._id as Types.ObjectId);
  }

  // Phase 2: attach children to their parents by name.
  for (const row of PAGES) {
    if (!row.parentName) continue;
    const parentId = idByName.get(row.parentName);
    if (!parentId) {
      throw new Error(
        `Page "${row.name}" references unknown parentName "${row.parentName}"`
      );
    }
    await Page.updateOne({ name: row.name }, { $set: { parent_id: parentId } });
  }

  console.log(`✓ Pages seeded (${PAGES.length})`);
  return idByName;
}

// ---------------------------------------------------------------------------
// Roles → Map<name, _id>  (permissions array replaced wholesale each run)
// ---------------------------------------------------------------------------

function buildPermissionPairs(
  role: (typeof ROLES)[number],
  pageIds: Map<string, Types.ObjectId>,
  permIds: Map<string, Types.ObjectId>
): { page_id: Types.ObjectId; permission_id: Types.ObjectId }[] {
  const pairs: { page_id: Types.ObjectId; permission_id: Types.ObjectId }[] = [];

  const permsForPage = (page: SeedPage): string[] => {
    if (role.allPermissions) return role.allPermissions;
    const isTicket = TICKET_PAGE_PATHS.has(page.path);
    return isTicket
      ? (role.ticketPermissions ?? [])
      : (role.basePermissions ?? []);
  };

  for (const page of PAGES) {
    const pageId = pageIds.get(page.name);
    if (!pageId) {
      throw new Error(`Missing page _id for "${page.name}"`);
    }
    for (const permName of permsForPage(page)) {
      const permId = permIds.get(permName);
      if (!permId) {
        throw new Error(`Missing permission _id for "${permName}"`);
      }
      pairs.push({ page_id: pageId, permission_id: permId });
    }
  }

  return pairs;
}

async function seedRoles(
  pageIds: Map<string, Types.ObjectId>,
  permIds: Map<string, Types.ObjectId>
): Promise<Map<string, Types.ObjectId>> {
  const idByName = new Map<string, Types.ObjectId>();

  for (const role of ROLES) {
    const pairs = buildPermissionPairs(role, pageIds, permIds);

    const doc = await Role.findOneAndUpdate(
      { name: role.name },
      {
        $setOnInsert: {
          name: role.name,
          created_at: new Date(),
        },
        $set: {
          description: role.description,
          status: "Active",
          deleted_at: null,
          deleted_by: null,
          deleted_reason: null,
          // Seed matrix is source-of-truth — replace wholesale.
          // Do NOT use $addToSet (AGENTS.md: breaks on _id:false subdocs).
          permissions: pairs,
        },
      },
      { upsert: true, new: true }
    );
    idByName.set(role.name, doc._id as Types.ObjectId);
    console.log(`  ✓ Role "${role.name}" (${pairs.length} permission pairs)`);
  }

  console.log(`✓ Roles seeded (${ROLES.length})`);
  return idByName;
}

// ---------------------------------------------------------------------------
// Default admin user
// ---------------------------------------------------------------------------

async function seedAdminUser(
  roleIds: Map<string, Types.ObjectId>
): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const firstName = process.env.SEED_ADMIN_FIRST_NAME || "Admin";
  const lastName = process.env.SEED_ADMIN_LAST_NAME || "User";

  const adminRoleId = roleIds.get("Administrator");
  if (!adminRoleId) {
    throw new Error('Missing Administrator role _id — cannot create admin user');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    {
      // Never clobber a password the buyer already changed.
      $setOnInsert: {
        email,
        password_hash: passwordHash,
        created_at: new Date(),
      },
      $set: {
        first_name: firstName,
        last_name: lastName,
        role_id: adminRoleId,
        status: "Active",
        is_verified: true,
        email_verified_at: new Date(),
        department_id: null,
      },
    },
    { upsert: true, new: true }
  );

  console.log(`✓ Admin user seeded (${email})`);
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

async function seed() {
  try {
    assertSeedData();
    assertIcons();

    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected.\n");

    console.log("Seeding permissions...");
    const permIds = await seedPermissions();

    console.log("Seeding pages...");
    const pageIds = await seedPages();

    console.log("Seeding roles...");
    const roleIds = await seedRoles(pageIds, permIds);

    console.log("Seeding admin user...");
    await seedAdminUser(roleIds);

    console.log("\n✓ Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

seed();
