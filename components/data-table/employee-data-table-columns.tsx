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
import type { Employee } from "@/lib/types/employee";
import { DataTableColumnHeader } from "./data-table-column-header";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Deleted: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  employee: Employee;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onRestore: (employee: Employee) => void;
}

function Actions({ employee, onView, onEdit, onDelete, onRestore }: ActionsProps) {
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/employees", "Edit");
  const canDelete = hasPermission("/employees", "Delete");
  const canRestore = hasPermission("/employees", "Restore");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(employee)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View Details
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(employee)} className="cursor-pointer gap-2 text-[#1a1f36]">
            <Edit className="h-4 w-4 text-[#64748b]" />
            Edit Employee
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!employee.deleted_at ? (
          canDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(employee)}
              className="cursor-pointer gap-2 text-[#dc2626]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )
        ) : (
          canRestore && (
            <DropdownMenuItem
              onClick={() => onRestore(employee)}
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

export function createEmployeeColumns(
  onView: (employee: Employee) => void,
  onEdit: (employee: Employee) => void,
  onDelete: (employee: Employee) => void,
  onRestore: (employee: Employee) => void
): ColumnDef<Employee>[] {
  return [
    {
      accessorKey: "emp_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Emp No" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("emp_no") as string;
        return value ? (
          <span className="font-medium text-[#1a1f36]">{value}</span>
        ) : (
          <span className="text-sm text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      accessorFn: (row) => `${row.firstname} ${row.lastname}`,
      cell: ({ row }) => {
        const employee = row.original as Employee;
        return (
          <span className="font-medium text-[#1a1f36]">{employee.firstname} {employee.lastname}</span>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("email") as string;
        return value ? (
          <span className="text-sm text-[#1a1f36]">{value}</span>
        ) : (
          <span className="text-sm text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "department_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Department" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("department_name") as string;
        return value ? (
          <span className="text-sm text-[#1a1f36]">{value}</span>
        ) : (
          <span className="text-sm text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "contact_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact No" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("contact_no") as string;
        return value ? (
          <span className="text-sm text-[#1a1f36]">{value}</span>
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
          employee={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ),
    },
  ];
}
