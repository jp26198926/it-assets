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
import type { Ticket } from "@/lib/types/ticket";
import { DataTableColumnHeader } from "./data-table-column-header";

const priorityConfig: Record<string, { color: string }> = {
  Low: { color: "bg-blue-50 text-blue-700" },
  Medium: { color: "bg-amber-50 text-amber-700" },
  High: { color: "bg-orange-50 text-orange-700" },
  Critical: { color: "bg-red-50 text-red-700" },
};

const statusConfig: Record<string, { color: string; dot: string }> = {
  Open: { color: "bg-[#dbeafe] text-[#1d4ed8]", dot: "bg-[#1d4ed8]" },
  "In Progress": { color: "bg-[#fef3c7] text-[#b45309]", dot: "bg-[#b45309]" },
  Resolved: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Closed: { color: "bg-[#e2e8f0] text-[#475569]", dot: "bg-[#475569]" },
  Deleted: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  ticket: Ticket;
  onView: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onRestore: (ticket: Ticket) => void;
}

function Actions({ ticket, onView, onEdit, onDelete, onRestore }: ActionsProps) {
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/tickets", "Edit");
  const canDelete = hasPermission("/tickets", "Delete");
  const canRestore = hasPermission("/tickets", "Restore");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(ticket)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View Details
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(ticket)} className="cursor-pointer gap-2 text-[#1a1f36]">
            <Edit className="h-4 w-4 text-[#64748b]" />
            Edit Ticket
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!ticket.deleted_at ? (
          canDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(ticket)}
              className="cursor-pointer gap-2 text-[#dc2626]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )
        ) : (
          canRestore && (
            <DropdownMenuItem
              onClick={() => onRestore(ticket)}
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

export function createTicketColumns(
  onView: (ticket: Ticket) => void,
  onEdit: (ticket: Ticket) => void,
  onDelete: (ticket: Ticket) => void,
  onRestore: (ticket: Ticket) => void
): ColumnDef<Ticket>[] {
  return [
    {
      accessorKey: "ticket_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ticket No" />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium text-[#1a1f36]">{row.getValue("ticket_no")}</span>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-[#1a1f36] max-w-[200px] truncate block">{row.getValue("title")}</span>
      ),
    },
    {
      accessorKey: "category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[#1a1f36]">{(row.original as Ticket).category_name || "N/A"}</span>
      ),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const config = priorityConfig[priority] || priorityConfig.Low;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>
            {priority}
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
        const config = statusConfig[status] || statusConfig.Open;
        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${config.color}`}>
            <span className={`size-1.5 ${config.dot}`} />
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "assigned_to_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[#1a1f36]">{(row.original as Ticket).assigned_to_name || "Unassigned"}</span>
      ),
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
          ticket={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ),
    },
  ];
}
