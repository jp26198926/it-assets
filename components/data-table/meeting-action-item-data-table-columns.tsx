"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import { formatInAppTimezone } from "@/lib/utils/timezone";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useAuthorization } from "@/hooks/use-authorization";
import type { MeetingActionItem } from "@/lib/types/meeting-action-item";

export function createMeetingActionItemColumns(
  onView: (item: MeetingActionItem) => void,
  onEdit: (item: MeetingActionItem) => void,
  onDelete: (item: MeetingActionItem) => void,
  onRestore: (item: MeetingActionItem) => void,
  timezone?: string | null
): ColumnDef<MeetingActionItem>[] {
  function Actions({ item }: { item: MeetingActionItem }) {
    const { hasPermission } = useAuthorization();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(item)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {hasPermission("/meeting-action-items", "Edit") && (
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Action Item
            </DropdownMenuItem>
          )}
          {item.deleted_at ? (
            hasPermission("/meeting-action-items", "Restore") && (
              <DropdownMenuItem
                onClick={() => onRestore(item)}
                className="text-green-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
            )
          ) : (
            hasPermission("/meeting-action-items", "Delete") && (
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-[#1a1f36]">
          {row.getValue("title")}
        </span>
      ),
    },
    {
      accessorKey: "meeting_title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Meeting" />
      ),
      cell: ({ row }) => {
        const title = row.original.meeting_title;
        const no = row.original.meeting_no;
        return (
          <span className="text-sm">
            {no ? `#${no}` : ""} {title || "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "assigned_to_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => {
        const val = row.getValue("assigned_to_name") as string | null;
        return val ? (
          <span>{val}</span>
        ) : (
          <span className="italic text-muted-foreground">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "due_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        const val = row.getValue("due_date") as Date | null;
        if (!val)
          return (
            <span className="italic text-muted-foreground">N/A</span>
          );
        const isOverdue = new Date(val) < new Date();
        return (
          <span
            className={`tabular-nums ${isOverdue ? "text-red-600 font-medium" : ""}`}
          >
            {formatInAppTimezone(val, "MMM dd, yyyy", timezone)}
          </span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const config: Record<string, { color: string }> = {
          Low: { color: "bg-gray-50 text-gray-700" },
          Medium: { color: "bg-blue-50 text-blue-700" },
          High: { color: "bg-amber-50 text-amber-700" },
          Urgent: { color: "bg-red-50 text-red-700" },
        };
        const c = config[priority] || config.Medium;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${c.color}`}
          >
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
        const config: Record<string, { color: string; dot: string }> = {
          Pending: {
            color: "bg-gray-50 text-gray-700",
            dot: "bg-gray-500",
          },
          "In Progress": {
            color: "bg-blue-50 text-blue-700",
            dot: "bg-blue-500",
          },
          Completed: {
            color: "bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500",
          },
          Cancelled: {
            color: "bg-rose-50 text-rose-700",
            dot: "bg-rose-500",
          },
          Deleted: {
            color: "bg-rose-50 text-rose-700",
            dot: "bg-rose-500",
          },
        };
        const c = config[status] || config.Pending;
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${c.color}`}
          >
            <span className={`size-1.5 rounded-full ${c.dot}`} />
            {status}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => <Actions item={row.original} />,
    },
  ];
}
