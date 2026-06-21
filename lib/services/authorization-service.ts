import { connectDB } from "@/lib/db/connection";
import { Role as RoleModel } from "@/lib/db/models/role";
import { Page as PageModel } from "@/lib/db/models/page";
import { Permission as PermissionModel } from "@/lib/db/models/permission";

interface CachedPermissions {
  pagePermissions: Record<string, string[]>;
  expiry: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CachedPermissions>();

async function fetchRolePermissions(
  roleId: string
): Promise<Record<string, string[]>> {
  await connectDB();

  const role = await RoleModel.findById(roleId).lean();
  if (!role) return {};

  const rawPerms = (role as unknown as { permissions: { page_id: unknown; permission_id: unknown }[] }).permissions || [];

  if (rawPerms.length === 0) return {};

  const pageIds = [...new Set(rawPerms.map((p) => (p.page_id as { toString(): string }).toString()))];
  const permIds = [...new Set(rawPerms.map((p) => (p.permission_id as { toString(): string }).toString()))];

  const [pages, permissions] = await Promise.all([
    PageModel.find({ _id: { $in: pageIds } }).select("path").lean(),
    PermissionModel.find({ _id: { $in: permIds } }).select("name").lean(),
  ]);

  const pageMap = new Map(
    pages.map((p) => [(p._id as { toString(): string }).toString(), p.path])
  );
  const permMap = new Map(
    permissions.map((p) => [(p._id as { toString(): string }).toString(), p.name])
  );

  const result: Record<string, string[]> = {};

  for (const entry of rawPerms) {
    const pageId = (entry.page_id as { toString(): string }).toString();
    const permId = (entry.permission_id as { toString(): string }).toString();
    const pagePath = pageMap.get(pageId);
    const permName = permMap.get(permId);

    if (pagePath && permName) {
      if (!result[pagePath]) result[pagePath] = [];
      if (!result[pagePath].includes(permName)) {
        result[pagePath].push(permName);
      }
    }
  }

  return result;
}

export async function getUserPagePermissions(
  roleId: string
): Promise<Record<string, string[]>> {
  if (!roleId) return {};

  const cached = cache.get(roleId);
  if (cached && cached.expiry > Date.now()) {
    return cached.pagePermissions;
  }

  const pagePermissions = await fetchRolePermissions(roleId);

  cache.set(roleId, { pagePermissions, expiry: Date.now() + CACHE_TTL });

  return pagePermissions;
}

export async function hasPermission(
  roleId: string,
  pagePath: string,
  permissionName: string
): Promise<boolean> {
  if (!roleId) return false;

  const permissions = await getUserPagePermissions(roleId);
  const pagePerms = permissions[pagePath];
  return pagePerms?.includes(permissionName) ?? false;
}

export async function hasAccess(
  roleId: string,
  pagePath: string
): Promise<boolean> {
  return hasPermission(roleId, pagePath, "Access");
}

export function invalidateCache(roleId?: string) {
  if (roleId) {
    cache.delete(roleId);
  } else {
    cache.clear();
  }
}
