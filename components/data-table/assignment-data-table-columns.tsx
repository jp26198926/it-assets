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
import { MoreHorizontal, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import { useAuthorization } from "@/hooks/use-authorization";
import type { Assignment } from "@/lib/types/assignment";
import { DataTableColumnHeader } from "./data-table-column-header";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Returned: { color: "bg-[#dbeafe] text-[#2563eb]", dot: "bg-[#2563eb]" },
  Deleted: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  assignment: Assignment;
  onView: (assignment: Assignment) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  onRestore: (assignment: Assignment) => void;
}

function Actions({ assignment, onView, onEdit, onDelete, onRestore }: ActionsProps) {
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/assignments", "Edit");
  const canDelete = hasPermission("/assignments", "Delete");
  const canRestore = hasPermission("/assignments", "Restore");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(assignment)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View Details
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(assignment)} className="cursor-pointer gap-2 text-[#1a1f36]">
            <Edit className="h-4 w-4 text-[#64748b]" />
            Edit Assignment
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!assignment.deleted_at ? (
          canDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(assignment)}
              className="cursor-pointer gap-2 text-[#dc2626]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )
        ) : (
          canRestore && (
            <DropdownMenuItem
              onClick={() => onRestore(assignment)}
              className="cursor-pointer gap-2 text-[#059669]"
            >
              <RotateCcw className="h-4 w-4" />
              Restore
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function createAssignmentColumns(
  onView: (assignment: Assignment) => void,
  onEdit: (assignment: Assignment) => void,
  onDelete: (assignment: Assignment) => void,
  onRestore: (assignment: Assignment) => void
): ColumnDef<Assignment>[] {
  return [
    {
      accessorKey: "asset_barcode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Asset Barcode" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-[#1a1f36]">{row.getValue("asset_barcode") || "N/A"}</span>
      ),
    },
    {
      accessorKey: "item_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[#1a1f36]">{(row.getValue("item_name") as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "serial_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Serial No." />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[#1a1f36]">{(row.getValue("serial_number") as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "item_category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[#1a1f36]">{(row.getValue("item_category_name") as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "employee_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[#1a1f36]">{(row.getValue("employee_name") as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "department_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Department" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[#1a1f36]">{(row.getValue("department_name") as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "assigned_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("assigned_date") as Date;
        return (
          <span className="text-sm tabular-nums text-[#1a1f36]">
            {format(new Date(date), "MMM dd, yyyy")}
          </span>
        );
      },
    },
    {
      accessorKey: "returned_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Returned Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("returned_date") as Date | null;
        return (
          <span className="text-sm tabular-nums text-[#1a1f36]">
            {date ? format(new Date(date), "MMM dd, yyyy") : "—"}
          </span>
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
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Actions
          assignment={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ),
    },
  ];
}
