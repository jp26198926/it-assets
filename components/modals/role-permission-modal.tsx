"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Shield, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getRolePermissions,
  createRolePermission,
  deleteRolePermission,
} from "@/lib/actions/role-permission-actions";
import { getPages } from "@/lib/actions/page-actions";
import { getPermissions } from "@/lib/actions/permission-actions";
import type { Role } from "@/lib/types/role";
import type { Page } from "@/lib/types/page";
import type { Permission } from "@/lib/types/permission";
import type { RolePermissionEntry } from "@/lib/types/role-permission";

interface RolePermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

export function RolePermissionModal({
  open,
  onOpenChange,
  role,
}: RolePermissionModalProps) {
  const [records, setRecords] = useState<RolePermissionEntry[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [sortField, setSortField] = useState<"page_name" | "permission_name" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async (roleId: string) => {
    setLoading(true);
    try {
      const [recordsData, pagesData, permissionsData] = await Promise.all([
        getRolePermissions(roleId),
        getPages(),
        getPermissions(),
      ]);
      setRecords(recordsData);
      setPages(pagesData);
      setPermissions(permissionsData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && role) {
      loadData(role.id);
      setSelectedPage("");
      setSelectedPermission("");
    }
  }, [open, role, loadData]);

  const handleAdd = async () => {
    if (!role || !selectedPage || !selectedPermission) {
      toast.error("Please select both page and permission");
      return;
    }

    setAdding(true);
    try {
      await createRolePermission(role.id, {
        page_id: selectedPage,
        permission_id: selectedPermission,
      });
      toast.success("Permission added");
      loadData(role.id);
    } catch (e) {
      console.error("[Modal] add error:", e);
      toast.error("Failed to add permission");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (record: RolePermissionEntry) => {
    if (!role) return;
    try {
      await deleteRolePermission(role.id, record.page_id, record.permission_id);
      toast.success("Permission removed");
      loadData(role.id);
    } catch (e) {
      console.error("[Modal] remove error:", e);
      toast.error("Failed to remove permission");
    }
  };

  const handleSort = (field: "page_name" | "permission_name") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (r.page_name || "").toLowerCase().includes(q) || (r.permission_name || "").toLowerCase().includes(q);
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = (a[sortField] || "").toLowerCase();
    const bVal = (b[sortField] || "").toLowerCase();
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const SortIcon = ({ field }: { field: "page_name" | "permission_name" }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-[#94a3b8]" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-[#3b82f6]" />
      : <ArrowDown className="h-3.5 w-3.5 text-[#3b82f6]" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col max-h-[85vh] sm:max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions — {role?.name}
          </DialogTitle>
          <DialogDescription>
            Manage page permissions assigned to this role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-1">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Page
              </label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select page..." />
                </SelectTrigger>
                <SelectContent>
                  {pages
                    .filter((p) => !p.deleted_at)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Permission
              </label>
              <Select
                value={selectedPermission}
                onValueChange={setSelectedPermission}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select permission..." />
                </SelectTrigger>
                <SelectContent>
                  {permissions
                    .filter((p) => !p.deleted_at)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((perm) => (
                      <SelectItem key={perm.id} value={perm.id}>
                        {perm.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              className="h-9 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              onClick={handleAdd}
              disabled={adding || !selectedPage || !selectedPermission}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-[#64748b]">Loading...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex items-center justify-center h-32 border border-dashed border-[#e2e8f0] rounded-lg">
              <p className="text-sm text-[#64748b]">
                No permissions assigned yet.
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
                <Input
                  placeholder="Search by page or permission..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 bg-[#f0f4f8] border-0 text-sm"
                />
              </div>
              <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th
                      className="text-left px-4 py-2.5 font-semibold text-[#1a1f36] cursor-pointer hover:bg-[#f0f4f8] select-none"
                      onClick={() => handleSort("page_name")}
                    >
                      <span className="flex items-center gap-1.5">
                        Page <SortIcon field="page_name" />
                      </span>
                    </th>
                    <th
                      className="text-left px-4 py-2.5 font-semibold text-[#1a1f36] cursor-pointer hover:bg-[#f0f4f8] select-none"
                      onClick={() => handleSort("permission_name")}
                    >
                      <span className="flex items-center gap-1.5">
                        Permission <SortIcon field="permission_name" />
                      </span>
                    </th>
                    <th className="text-right px-4 py-2.5 font-semibold text-[#1a1f36]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map((record) => (
                    <tr
                      key={`${record.page_id}-${record.permission_id}`}
                      className="border-b border-[#f0f4f8] last:border-0 hover:bg-[#f8fafc]"
                    >
                      <td className="px-4 py-2.5 text-[#1a1f36]">
                        {record.page_name}
                      </td>
                      <td className="px-4 py-2.5 text-[#1a1f36]">
                        {record.permission_name}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[#dc2626] hover:text-[#dc2626] hover:bg-red-50"
                          onClick={() => handleRemove(record)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
