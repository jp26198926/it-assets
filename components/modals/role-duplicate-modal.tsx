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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { getRoleById } from "@/lib/actions/role-actions";
import type { Role, CreateRoleInput, RolePermissionEntry } from "@/lib/types/role";
import { toast } from "sonner";

interface RoleDuplicateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSubmit: (data: CreateRoleInput) => Promise<void>;
}

export function RoleDuplicateModal({
  open,
  onOpenChange,
  role,
  onSubmit,
}: RoleDuplicateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<RolePermissionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadRole = useCallback(async (roleId: string) => {
    setFetching(true);
    try {
      const fullRole = await getRoleById(roleId);
      if (fullRole) {
        setPermissions(fullRole.permissions);
      }
    } catch {
      toast.error("Failed to load role details");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (open && role) {
      setName(`Copy of ${role.name}`);
      setDescription(role.description || "");
      setErrors({});
      loadRole(role.id);
    }
  }, [open, role, loadRole]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          name: name.trim(),
          description: description || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to duplicate role" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate Role
          </DialogTitle>
          <DialogDescription>
            Create a copy of &quot;{role?.name}&quot; with a new name. All permissions will be copied.
          </DialogDescription>
        </DialogHeader>
        <form id="role-duplicate-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label htmlFor="duplicate-name">Name *</Label>
            <Input
              id="duplicate-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Copy of Administrator"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              id="duplicate-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions to Copy</Label>
            {fetching ? (
              <div className="flex items-center justify-center h-24 border border-dashed border-[#e2e8f0] rounded-lg">
                <p className="text-sm text-[#64748b]">Loading permissions...</p>
              </div>
            ) : permissions.length === 0 ? (
              <div className="flex items-center justify-center h-24 border border-dashed border-[#e2e8f0] rounded-lg">
                <p className="text-sm text-[#64748b]">No permissions to copy.</p>
              </div>
            ) : (
              <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <th className="text-left px-4 py-2.5 font-semibold text-[#1a1f36]">Page</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-[#1a1f36]">Permission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...permissions].sort((a, b) => (a.page_name || "").localeCompare(b.page_name || "")).map((perm) => (
                      <tr
                        key={`${perm.page_id}-${perm.permission_id}`}
                        className="border-b border-[#f0f4f8] last:border-0 hover:bg-[#f8fafc]"
                      >
                        <td className="px-4 py-2.5 text-[#1a1f36]">{perm.page_name || perm.page_id}</td>
                        <td className="px-4 py-2.5 text-[#1a1f36]">{perm.permission_name || perm.permission_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="role-duplicate-form" disabled={loading || fetching}>
            {loading ? "Duplicating..." : "Duplicate Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
