# Implementation Plan — Full Database Seed Script (it-assets)

**Goal**: buyer clones repo → sets `MONGODB_URI` → runs `npm run db:seed` → logs in and can use every CRUD page.

---

## 1. File layout

| Action | Path | Purpose |
|---|---|---|
| **Create** | `lib/db/seed-data.ts` | All hardcoded seed constants (pages, permissions, roles + matrices). Pure data, no I/O. |
| **Rewrite** | `lib/db/seed.ts` | Orchestration: connect → seed permissions → pages → roles → admin user → disconnect. |
| **Edit** | `package.json` | **No change needed** — `db:seed` already points at `lib/db/seed.ts`. |
| **Edit** | `.env.example` | Document `SEED_ADMIN_*` vars (optional but recommended). |
| **Leave** | `scripts/seed-ticket-report-page.ts` | Becomes redundant (its page is covered by the new seed) but harmless — it self-skips. Note in README that `db:seed` supersedes it. |

**Recommendation — replace `lib/db/seed.ts` rather than add `scripts/seed.ts`:**
- `npm run db:seed` is the documented entry point; buyers should not need a new command.
- Avoids two divergent seeds (current file only upserts role `Viewer`).
- Keeps `scripts/` for one-off migrations/timezones.

Split data vs. logic so the data file stays scannable (~36 page rows + 9 permissions + 3 matrices) and the orchestrator stays ~150 lines.

---

## 2. Seed data structures (`lib/db/seed-data.ts`)

### 2.1 Permissions (9 docs, upsert key = `name`)

```ts
export const PERMISSIONS = [
  { name: "Access",  description: "API GET access gate" },
  { name: "View",    description: "Sidebar visibility and page guard" },
  { name: "Add",     description: "Create records" },
  { name: "Edit",    description: "Update records" },
  { name: "Delete",  description: "Soft-delete records" },
  { name: "Restore", description: "Restore soft-deleted records" },
  { name: "Export",  description: "Toolbar export buttons" },
  { name: "Assign",  description: "Assign tickets to technicians" },
  { name: "Print",   description: "Show Print button" },
] as const;
```

Exact strings — code matches on them literally (`withPageAuth("/x", "Access")`, `hasPermission("/x", "Export")`, etc.).

### 2.2 Pages — 31 leaf + 5 parent-group = **36 docs**

Type:
```ts
interface SeedPage {
  name: string;          // unique upsert key
  path: string;          // NOT unique in schema
  icon: string;          // MUST be a key of lib/icon-map.ts
  parentName: string | null;
  section: string | null;
  order: number;
  description?: string;
}
```

**Sidebar hierarchy** (from `components/layout/app-sidebar.tsx:57` — parents with children render as `CollapsibleTrigger`, never a `Link`, so parent `path` is never navigated; use non-routable `/group/*` paths to avoid colliding with leaf paths in the permission map, which is keyed by `path` — see `lib/services/authorization-service.ts:43-55`):

```
Dashboard            /dashboard            LayoutDashboard   order 10   section "Main"
Assets               /assets               Laptop            order 20   section "Main"
Assignments          /assignments          ClipboardList     order 30   section "Main"
Employees            /employees            UsersRound        order 40   section "Main"

Inventory            /group/inventory      Package           order 50   section "Inventory"
  Items              /items                Package           order 51
  Categories         /categories           Tag               order 52
  Units of Measure   /uoms                 Layers            order 53
  Locations          /locations            MapPin            order 54
  Suppliers          /suppliers            Truck             order 55

Stock                /group/stock          Archive           order 60   section "Stock"
  Stock Levels       /stock-levels         BarChart3         order 61
  Stock Movements    /stock-movements      Activity          order 62
  Adjustments        /adjustments          RefreshCw         order 63
  Conversions        /conversions          Layers            order 64
  Receivings         /receivings           Download          order 65
  Releasings         /releasings           Upload            order 66
  Transfers          /transfers            ShoppingCart      order 67

Tickets              /group/tickets        AlertTriangle     order 70   section "Tickets"
  Tickets            /tickets              FileText          order 71
  Ticket Categories  /ticket-categories    Tag               order 72
  Ticket Reports     /ticket-report        PieChart          order 73

Meetings             /group/meetings       Calendar          order 80   section "Meetings"
  Meetings           /meetings             Briefcase         order 81
  Meeting Types      /meeting-types        Tag               order 82
  Meeting Action Items /meeting-action-items ClipboardList   order 83

Settings             /group/settings       Settings          order 90   section "Settings"
  Users              /users                Users             order 91
  Roles              /roles                Shield            order 92
  Permissions        /permissions          Key               order 93
  Pages              /pages                FileStack         order 94
  Departments        /departments          Building          order 95
  Application        /application          Server            order 96
  Mail               /mail                 Mail              order 97
  SMS                /sms                  Bell              order 98
  Cloudinary         /cloudinary           Cloud             order 99
```

Icon names above are all valid keys in `lib/icon-map.ts:53-102` (verified against that map). Icon reuse across pages is fine.

Leaf `path` values are the 31 exact strings from the app routes (`app/(dashboard)/` directory listing verified). Parent paths (`/group/*`) are synthetic — required by schema (`path` is required), never routed, never permission-checked for sidebar visibility (`buildMenuTree` keeps a parent if it has any visible child — `app-sidebar.tsx:82-88`).

**Name for `/ticket-report` must be `"Ticket Reports"`** — matches existing `scripts/seed-ticket-report-page.ts:22` so re-runs / partial legacy data upsert to the same doc.

### 2.3 Roles + permission matrices (3 docs, upsert key = `name`)

```ts
type RoleSeed = {
  name: string;            // exact: "Administrator" | "Viewer" | "Technician"
  description: string;
  // Which permission names apply, either "all" or a list;
  // which page names they apply to, either "all" or a list.
  permissions: "all" | string[];   // permission names
  pages: "all" | string[];         // page names
};
```

| Role | Permissions | Pages | Rationale |
|---|---|---|---|
| **Administrator** | all 9 | all 36 | `ticket-service.ts:707` grants full ticket visibility; full CRUD everywhere. |
| **Viewer** | `Access`, `View`, `Export` | all 36 | Read-only, exactly as decided. Exists is **mandatory** — `createInactiveUser` (`user-service.ts:272`) and ticket auto-registration (`ticket-service.ts:567`) throw if missing. |
| **Technician** | all 9 on ticket pages; `Access`,`View`,`Export` elsewhere | tickets trio: `/tickets`, `/ticket-categories`, `/ticket-report`; Access/View/Export on the other 33 | Middle ground (recommended): `ticket-service.ts:1090` makes Technician assignable and scoped ticket visibility (`:713`); `ticket-comment-service.ts:190` treats them as full ticket operators. They must **not** manage master data (users/roles/pages/inventory) — that stays Administrator's job. Export elsewhere keeps reports usable. |

Notes:
- Include the 5 parent groups in every matrix with at least `Access`+`View` (Admin gets all 9). Cost is tiny; prevents `hasAccess("/group/…")` false-negatives if anything ever checks a group path. If you want the absolute minimum, parents can be omitted from matrices — sidebar still works (`hasChildView`).
- `Print` is documented in `README.md:599` and used by print utilities under `lib/utils/print-*.ts`. Admin gets it everywhere; Technician gets it on the ticket trio via "all 9"; Viewer does **not** (matches the "Viewer = Access+View+Export only" decision).

Matrix expansion at runtime:
```ts
// Pseudocode in seed.ts
const pairs: { page_id, permission_id }[] = [];
for (const pageName of resolvePages(role.pages))
  for (const permName of resolvePerms(role.permissions))
    pairs.push({ page_id: idByName.get(pageName), permission_id: idByPerm.get(permName) });
```
Admin → 9 × 36 = 324 entries; Viewer → 3 × 36 = 108; Technician → 3×33 + 9×3 = 126.

---

## 3. Orchestrator (`lib/db/seed.ts`)

Keep the existing run-style contract: `connectDB()` → work → `disconnectDB()` in `finally`; `process.exit(1)` on error. Import models the same way the current seed does (`./models/…`).

```ts
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "./connection";
import { Page } from "./models/page";
import { Permission } from "./models/permission";
import { Role } from "./models/role";
import { User } from "./models/user";
import { PERMISSIONS, PAGES, ROLES } from "./seed-data";

async function seedPermissions(): Promise<Map<string, Types.ObjectId>> { /* upsert by name */ }
async function seedPages(): Promise<Map<string, Types.ObjectId>>       { /* upsert by name, resolve parent_id */ }
async function seedRoles(pageIds, permIds): Promise<Map<string, Types.ObjectId>> { /* upsert + $set permissions */ }
async function seedAdminUser(roleIds): Promise<void> { /* env + bcrypt */ }

async function seed() {
  try {
    await connectDB();
    const permIds = await seedPermissions();
    const pageIds = await seedPages();
    const roleIds = await seedRoles(pageIds, permIds);
    await seedAdminUser(roleIds);
    console.log("\n✓ Seed completed successfully");
  } catch (e) {
    console.error("Seed failed:", e);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}
seed();
```

### 3.1 Idempotency strategy (safe re-run)

Upsert every row by its unique key. **Policy: insert-if-missing, update-if-present** for seed-owned fields (self-healing baseline). Do **not** touch non-seed collections.

| Entity | Upsert key | On insert | On existing |
|---|---|---|---|
| Permission | `name` | full doc + `created_at` | `$set` `description`, `status: "Active"`, `deleted_at: null` |
| Page | `name` | full doc + `created_at` | `$set` `description`, `path`, `icon`, `section`, `order`, `status: "Active"`, `deleted_at: null`, `parent_id` |
| Role | `name` | full doc + `permissions[]` | `$set` `description`, `status: "Active"`, `deleted_at: null`, **`permissions: <entire computed array>`** |
| User | `email` | names, `password_hash`, `role_id`, `status: "Active"`, `is_verified: true`, `email_verified_at` | `$set` `first_name`/`last_name`/`role_id`/`status`/`is_verified`/`email_verified_at` — **`password_hash` only via `$setOnInsert`** (never clobber a password the buyer changed) |

Key snippets:

```ts
// Permission / Page / Role — pattern
const doc = await Model.findOneAndUpdate(
  { name: row.name },
  {
    $setOnInsert: { name: row.name, created_at: new Date() },
    $set: { /* seed-owned fields, see table */ },
  },
  { upsert: true, new: true }
);
```

```ts
// Role permissions — replace wholesale (NOT $addToSet)
await Role.updateOne(
  { name: role.name },
  { $set: { permissions: pairs, updated_at: new Date() } }
);
```

**Why `$set` the whole array instead of `$push`/`$each`?** AGENTS.md forbids `$addToSet` on embedded subdocs (it compares `_id`, and these subdocs are `{ _id: false }`). `$push`/`$each` is the right call for the *app's* incremental add-permission UI. For the seed, the matrix is the source of truth — replacing the array is deterministic, re-run-safe, and removes deleted pairs. On first insert the same `$set` is harmless.

### 3.2 Page `parent_id` handling — two-phase name→id map

Do **not** rely on ObjectIds across runs. Resolve by name:

```ts
const idByName = new Map<string, Types.ObjectId>();

// Phase 1: upsert ALL pages (parents first in PAGES array is nice-to-have, not required),
// setting parent_id: null for now. Capture returned _id.
for (const row of PAGES) {
  const doc = await Page.findOneAndUpdate(
    { name: row.name },
    {
      $setOnInsert: { name: row.name, created_at: new Date() },
      $set: {
        description: row.description ?? null,
        path: row.path,
        icon: row.icon,
        section: row.section ?? null,
        order: row.order,
        status: "Active",
        deleted_at: null,
        parent_id: null, // provisional
      },
    },
    { upsert: true, new: true }
  );
  idByName.set(row.name, doc._id as Types.ObjectId);
}

// Phase 2: attach children to parents
for (const row of PAGES.filter((p) => p.parentName)) {
  await Page.updateOne(
    { name: row.name },
    { $set: { parent_id: idByName.get(row.parentName!)! } }
  );
}
```

This works on empty DB, partial DB, and re-runs. A missing parent name should `throw` with a clear message (catches typos in `seed-data.ts` at seed time).

### 3.3 Admin user

```ts
const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
const firstName = process.env.SEED_ADMIN_FIRST_NAME || "Admin";
const lastName = process.env.SEED_ADMIN_LAST_NAME || "User";
const passwordHash = await bcrypt.hash(password, 10); // matches user-service.ts:172

await User.findOneAndUpdate(
  { email: email.toLowerCase() },  // match login normalization if auth lowercases; verify auth-service and match it
  {
    $setOnInsert: {
      email,
      password_hash: passwordHash,
      created_at: new Date(),
    },
    $set: {
      first_name: firstName,
      last_name: lastName,
      role_id: roleIds.get("Administrator")!,
      status: "Active",
      is_verified: true,
      email_verified_at: new Date(),
      department_id: null,
    },
  },
  { upsert: true, new: true }
);
```

`is_verified: true` + `email_verified_at` set so login/OTP flows are skipped. `department_id` nullable (`user.ts:54-57`) — leave `null` (decision 4: other collections stay empty).

**Do not seed any other collections** — no departments, no sample assets/tickets. Departments page will simply be empty and usable.

---

## 4. npm script wiring

Keep as-is (`package.json:10`):
```json
"db:seed": "npx tsx --env-file=.env.local lib/db/seed.ts"
```
Run style already matches `scripts/seed-timezones.ts` conventions.

`.env.example` addition:
```
# Seed admin (used by npm run db:seed; defaults shown)
# SEED_ADMIN_EMAIL=admin@example.com
# SEED_ADMIN_PASSWORD=admin123
# SEED_ADMIN_FIRST_NAME=Admin
# SEED_ADMIN_LAST_NAME=User
```

---

## 5. Edge cases

| Case | Behavior |
|---|---|
| **Empty DB** | Full seed: 9 permissions, 36 pages, 3 roles (with matrices), 1 admin user. |
| **Partially seeded DB** | Upserts fill only what's missing; existing rows get seed-owned fields refreshed; `parent_id` re-resolved by name. |
| **Role `"Viewer"` already exists** (from old `db:seed`) | Upsert by name updates it and `$set`s the real permission matrix — fully superseded. No duplicate (unique index on `name`). |
| **Old `lib/db/seed.ts` already ran, pages missing** | New seed creates everything else; Viewer role is upgraded in place. |
| **Admin user already exists with a different password** | `password_hash` is `$setOnInsert` only → password preserved. Role/status/verified are forced so the account stays Administrator + Active. Document this in seed output: "existing user left password unchanged". |
| **Missing `MONGODB_URI`** | `connectDB()` throws (`connection.ts:7-8`) with a clear message; seed exits 1. |
| **Missing `SEED_ADMIN_*`** | Defaults apply (`admin@example.com` / `admin123`). Log the email used (never the password). |
| **Soft-deleted seed page/role/permission** (`deleted_at` set) | Seed resurrects it (`status: "Active"`, `deleted_at: null`) — these are system baseline rows the app requires. Note this in a seed log line. |
| **Duplicate page names in `seed-data.ts`** | Second upsert overwrites the first; add a cheap assert at seed start: `assertUnique(PAGES.map(p => p.name))` and same for paths of leaves. |
| **Leaf `path` collision with parent `/group/*`** | Prevented by design (parents use `/group/*`). |
| **Email case** | Store and upsert lowercased if `auth-service` lowercases on login — implementer should peek at `auth-service.ts` login lookup and mirror it exactly. |

---

## 6. Verification steps (after implementation)

1. **Typecheck / build**: `npm run build` (or `npx tsc --noEmit`) — `lib/db/seed.ts` is outside Next's app tree but still compiled by tsx at runtime; build catches model typing issues.
2. **Fresh DB run**:
   - Point `MONGODB_URI` at an empty database (e.g. `mongodb://localhost:27017/it-assets-seed-test`).
   - `npm run db:seed` → expect clean exit 0 and log lines per section.
   - Counts (mongosh or Compass):
     - `permissions` = 9
     - `pages` = 36 (5 with `parent_id != null`… actually 31 children with parent set + 5 parents = 31 with parent, 5 without)
     - `roles` = 3; Administrator `permissions.length` = 324 (or 279 if parents excluded from matrices)
     - `users` = 1, `is_verified: true`, `role_id` → Administrator
3. **Idempotency**: run `npm run db:seed` a second time → all counts unchanged, no duplicate-key errors, admin `password_hash` unchanged (compare before/after).
4. **Legacy Viewer-only DB**: with a DB where only role `Viewer` exists (old seed), run new seed → Viewer now has Access/View/Export matrix; Administrator/Technician added; no dup roles.
5. **Boot + login**:
   - `npm run dev`, log in with `admin@example.com` / `admin123` (or env values).
   - Sidebar shows Dashboard, Assets, Assignments, Employees + 5 collapsible groups with the right children.
   - Open **every** CRUD page (all 31 routes) — each should load (empty tables are expected) and show Add/Export buttons for admin.
6. **API smoke**: hit one GET and one POST route (e.g. `GET/POST /api/uoms`) as admin — `Access`/`Add` gates pass.
7. **Viewer role smoke**: create a user with role Viewer via UI → log in → sidebar visible, Add/Edit/Delete buttons hidden, export visible.
8. **Ticket hard-deps**: open `/tickets`, create a ticket (auto-registration path needs Viewer role — already present); `/tickets` assign dropdown lists Administrator + Technician (`ticket-service.ts:1090`).
9. **Restore path**: soft-delete something as admin → Restore button appears (`Restore` permission wired).

---

## 7. Implementation order (for the coding agent)

1. `lib/db/seed-data.ts` — PERMISSIONS, PAGES (with `parentName`), ROLES matrices. Add `assertUnique` helpers' data.
2. `lib/db/seed.ts` — rewrite with the four seed functions + orchestration + logging.
3. `.env.example` — add `SEED_ADMIN_*` comment block.
4. (Optional) one-line README note under setup: `npm run db:seed` bootstraps pages/roles/permissions/admin.
5. Run verification steps 1–4 locally against a scratch DB.

No changes to models, services, or UI. No new collections. `package.json` scripts unchanged.
