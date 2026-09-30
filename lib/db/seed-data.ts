/**
 * Hardcoded seed data for a fresh install.
 * Pure data — no I/O. Consumed by lib/db/seed.ts.
 *
 * Strings here are matched literally by the app:
 * - Permission names  → authorization-service / withPageAuth call sites
 * - Page paths        → PageGuard, withPageAuth, hasPermission (keyed by path)
 * - Role names        → ticket-service ("Viewer" / "Administrator" / "Technician")
 */

export interface SeedPermission {
  name: string;
  description: string;
}

export interface SeedPage {
  name: string;
  path: string;
  icon: string;
  parentName: string | null;
  section: string | null;
  order: number;
  description?: string;
}

export interface SeedRole {
  name: string;
  description: string;
  /** Permission names granted on every page. */
  allPermissions: string[] | null;
  /** Permission names granted on every page NOT listed in `ticketPagePaths`. */
  basePermissions: string[] | null;
  /** Permission names granted on ticket-related pages. */
  ticketPermissions: string[] | null;
}

// ---------------------------------------------------------------------------
// Permissions (upsert key = name)
// ---------------------------------------------------------------------------

export const PERMISSIONS: SeedPermission[] = [
  { name: "Access", description: "API GET access gate" },
  { name: "View", description: "Sidebar visibility and page guard" },
  { name: "Add", description: "Create new records" },
  { name: "Edit", description: "Update existing records" },
  { name: "Delete", description: "Soft-delete records" },
  { name: "Restore", description: "Restore soft-deleted records" },
  { name: "Export", description: "Toolbar export buttons" },
  { name: "Assign", description: "Assign tickets to technicians" },
  { name: "Print", description: "Show Print button" },
];

// ---------------------------------------------------------------------------
// Pages (upsert key = name). 31 route leaves + 5 sidebar parent groups.
// Parent groups use non-routable /group/* paths so they never collide with a
// child's path in the path-keyed authorization map.
// ---------------------------------------------------------------------------

export const PAGES: SeedPage[] = [
  // Main
  { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard", parentName: null, section: "Main", order: 10 },
  { name: "Assets", path: "/assets", icon: "Laptop", parentName: null, section: "Main", order: 20, description: "IT asset registry" },
  { name: "Assignments", path: "/assignments", icon: "ClipboardList", parentName: null, section: "Main", order: 30, description: "Asset assignments to employees" },
  { name: "Employees", path: "/employees", icon: "UsersRound", parentName: null, section: "Main", order: 40 },

  // Inventory
  { name: "Inventory", path: "/group/inventory", icon: "Package", parentName: null, section: "Inventory", order: 50 },
  { name: "Items", path: "/items", icon: "Package", parentName: "Inventory", section: null, order: 51 },
  { name: "Categories", path: "/categories", icon: "Tag", parentName: "Inventory", section: null, order: 52 },
  { name: "Units of Measure", path: "/uoms", icon: "Layers", parentName: "Inventory", section: null, order: 53 },
  { name: "Locations", path: "/locations", icon: "MapPin", parentName: "Inventory", section: null, order: 54 },
  { name: "Suppliers", path: "/suppliers", icon: "Truck", parentName: "Inventory", section: null, order: 55 },

  // Stock
  { name: "Stock", path: "/group/stock", icon: "Archive", parentName: null, section: "Stock", order: 60 },
  { name: "Stock Levels", path: "/stock-levels", icon: "BarChart3", parentName: "Stock", section: null, order: 61 },
  { name: "Stock Movements", path: "/stock-movements", icon: "Activity", parentName: "Stock", section: null, order: 62 },
  { name: "Adjustments", path: "/adjustments", icon: "RefreshCw", parentName: "Stock", section: null, order: 63 },
  { name: "Conversions", path: "/conversions", icon: "Layers", parentName: "Stock", section: null, order: 64 },
  { name: "Receivings", path: "/receivings", icon: "Download", parentName: "Stock", section: null, order: 65 },
  { name: "Releasings", path: "/releasings", icon: "Upload", parentName: "Stock", section: null, order: 66 },
  { name: "Transfers", path: "/transfers", icon: "ShoppingCart", parentName: "Stock", section: null, order: 67 },

  // Tickets (parent name must not collide with child "Tickets")
  { name: "Support", path: "/group/tickets", icon: "AlertTriangle", parentName: null, section: "Tickets", order: 70 },
  { name: "Tickets", path: "/tickets", icon: "FileText", parentName: "Support", section: null, order: 71, description: "Support tickets" },
  { name: "Ticket Categories", path: "/ticket-categories", icon: "Tag", parentName: "Support", section: null, order: 72 },
  // Named "Ticket Reports" to match scripts/seed-ticket-report-page.ts (legacy upsert key).
  { name: "Ticket Reports", path: "/ticket-report", icon: "PieChart", parentName: "Support", section: null, order: 73 },

  // Meetings (parent name must not collide with child "Meetings")
  { name: "Meeting Center", path: "/group/meetings", icon: "Calendar", parentName: null, section: "Meetings", order: 80 },
  { name: "Meetings", path: "/meetings", icon: "Briefcase", parentName: "Meeting Center", section: null, order: 81 },
  { name: "Meeting Types", path: "/meeting-types", icon: "Tag", parentName: "Meeting Center", section: null, order: 82 },
  { name: "Meeting Action Items", path: "/meeting-action-items", icon: "ClipboardList", parentName: "Meeting Center", section: null, order: 83 },

  // Settings
  { name: "Settings", path: "/group/settings", icon: "Settings", parentName: null, section: "Settings", order: 90 },
  { name: "Users", path: "/users", icon: "Users", parentName: "Settings", section: null, order: 91 },
  { name: "Roles", path: "/roles", icon: "Shield", parentName: "Settings", section: null, order: 92 },
  { name: "Permissions", path: "/permissions", icon: "Key", parentName: "Settings", section: null, order: 93 },
  { name: "Pages", path: "/pages", icon: "FileStack", parentName: "Settings", section: null, order: 94 },
  { name: "Departments", path: "/departments", icon: "Building", parentName: "Settings", section: null, order: 95 },
  { name: "Application", path: "/application", icon: "Server", parentName: "Settings", section: null, order: 96 },
  { name: "Mail", path: "/mail", icon: "Mail", parentName: "Settings", section: null, order: 97 },
  { name: "SMS", path: "/sms", icon: "Bell", parentName: "Settings", section: null, order: 98 },
  { name: "Cloudinary", path: "/cloudinary", icon: "Cloud", parentName: "Settings", section: null, order: 99 },
];

// ---------------------------------------------------------------------------
// Roles (upsert key = name)
//
// - "Viewer" is MANDATORY: createInactiveUser and ticket auto-registration
//   do Role.findOne({ name: "Viewer" }) and throw if missing.
// - "Administrator" sees ALL tickets (ticket-service role check).
// - "Technician" is assignable as ticket assignee and has scoped ticket visibility.
// ---------------------------------------------------------------------------

/** Ticket-related page paths that get the full ticket permission set for Technicians. */
export const TICKET_PAGE_PATHS = new Set([
  "/tickets",
  "/ticket-categories",
  "/ticket-report",
]);

export const ROLES: SeedRole[] = [
  {
    name: "Administrator",
    description: "Full access to all pages and features",
    allPermissions: ["Access", "View", "Add", "Edit", "Delete", "Restore", "Export", "Assign", "Print"],
    basePermissions: null,
    ticketPermissions: null,
  },
  {
    name: "Viewer",
    description: "Read-only access to all pages",
    allPermissions: null,
    basePermissions: ["Access", "View", "Export"],
    ticketPermissions: ["Access", "View", "Export"],
  },
  {
    name: "Technician",
    description: "Full ticket operations; read-only on everything else",
    allPermissions: null,
    basePermissions: ["Access", "View", "Export"],
    ticketPermissions: ["Access", "View", "Add", "Edit", "Delete", "Restore", "Export", "Assign", "Print"],
  },
];

// ---------------------------------------------------------------------------
// Guards — fail fast on typos in this file.
// ---------------------------------------------------------------------------

export function assertSeedData(): void {
  const permissionNames = new Set<string>();
  for (const p of PERMISSIONS) {
    if (permissionNames.has(p.name)) {
      throw new Error(`Duplicate permission name in seed data: "${p.name}"`);
    }
    permissionNames.add(p.name);
  }

  const pageNames = new Set<string>();
  const pagePaths = new Set<string>();
  const knownNames = new Set(PAGES.map((p) => p.name));

  for (const page of PAGES) {
    if (pageNames.has(page.name)) {
      throw new Error(`Duplicate page name in seed data: "${page.name}"`);
    }
    pageNames.add(page.name);

    // Leaf paths must be unique (parent /group/* paths are also unique by construction).
    if (pagePaths.has(page.path)) {
      throw new Error(`Duplicate page path in seed data: "${page.path}"`);
    }
    pagePaths.add(page.path);

    if (page.parentName !== null && !knownNames.has(page.parentName)) {
      throw new Error(
        `Page "${page.name}" references unknown parentName "${page.parentName}"`
      );
    }
  }

  const roleNames = new Set<string>();
  for (const role of ROLES) {
    if (roleNames.has(role.name)) {
      throw new Error(`Duplicate role name in seed data: "${role.name}"`);
    }
    roleNames.add(role.name);

    const perms = role.allPermissions ?? [...(role.basePermissions ?? []), ...(role.ticketPermissions ?? [])];
    for (const perm of perms) {
      if (!permissionNames.has(perm)) {
        throw new Error(
          `Role "${role.name}" references unknown permission "${perm}"`
        );
      }
    }
  }

  if (!roleNames.has("Viewer")) {
    throw new Error('Seed data must include a role named exactly "Viewer"');
  }
  if (!roleNames.has("Administrator")) {
    throw new Error('Seed data must include a role named exactly "Administrator"');
  }
}
