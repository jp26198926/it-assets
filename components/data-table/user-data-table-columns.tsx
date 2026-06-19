"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, RotateCcw, KeyRound } from "lucide-react";
import type { User } from "@/lib/types/user";
import { DataTableColumnHeader } from "./data-table-column-header";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Deleted: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  onChangePassword: (user: User) => void;
}

function Actions({ user, onView, onEdit, onDelete, onRestore, onChangePassword }: ActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(user)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(user)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Edit className="h-4 w-4 text-[#64748b]" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChangePassword(user)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <KeyRound className="h-4 w-4 text-[#64748b]" />
          Change Password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!user.deleted_at ? (
          <DropdownMenuItem
            onClick={() => onDelete(user)}
            className="cursor-pointer gap-2 text-[#dc2626]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onRestore(user)}
            className="cursor-pointer gap-2 text-[#059669]"
          >
            <RotateCcw className="h-4 w-4" />
            Restore
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function createUserColumns(
  onView: (user: User) => void,
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  onRestore: (user: User) => void,
  onChangePassword: (user: User) => void
): ColumnDef<User>[] {
  return [
    {
      accessorKey: "first_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <span className="font-medium text-[#1a1f36]">
            {user.first_name} {user.last_name}
          </span>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[#1a1f36]">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "role_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <span className="text-sm text-[#1a1f36]">{user.role_name || "N/A"}</span>
        );
      },
    },
    {
      accessorKey: "department_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Department" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return user.department_name ? (
          <span className="text-sm text-[#1a1f36]">{user.department_name}</span>
        ) : (
          <span className="text-sm text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const config = statusConfig[status] || statusConfig.Active;
        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${config.color}`}>
            <span className={`size-1.5 ${config.dot}`} />
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as Date;
        return (
          <span className="text-sm tabular-nums text-[#1a1f36]">
            {format(new Date(date), "MMM dd, yyyy")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Actions
          user={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          onChangePassword={onChangePassword}
        />
      ),
    },
  ];
}
