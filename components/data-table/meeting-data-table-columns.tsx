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
import type { Meeting } from "@/lib/types/meeting";

export function createMeetingColumns(
  onView: (meeting: Meeting) => void,
  onEdit: (meeting: Meeting) => void,
  onDelete: (meeting: Meeting) => void,
  onRestore: (meeting: Meeting) => void,
  timezone?: string | null
): ColumnDef<Meeting>[] {
  function Actions({ meeting }: { meeting: Meeting }) {
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
          <DropdownMenuItem onClick={() => onView(meeting)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {meeting.deleted_at ? (
            hasPermission("/meetings", "Restore") && (
              <DropdownMenuItem
                onClick={() => onRestore(meeting)}
                className="text-green-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
            )
          ) : (
            hasPermission("/meetings", "Delete") && (
              <DropdownMenuItem
                onClick={() => onDelete(meeting)}
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
      accessorKey: "meeting_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="No." />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold text-[#1a1f36]">
          #{row.getValue("meeting_no")}
        </span>
      ),
    },
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
      accessorKey: "meeting_type_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const name = row.original.meeting_type_name;
        const color = row.original.meeting_type_color;
        if (!name) return <span className="italic text-muted-foreground">N/A</span>;
        return (
          <div className="flex items-center gap-1.5">
            {color && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="text-sm">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "scheduled_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatInAppTimezone(row.getValue("scheduled_date"), "MMM dd, yyyy", timezone)}
        </span>
      ),
    },
    {
      accessorKey: "start_time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Time" />
      ),
      cell: ({ row }) => {
        const start = row.getValue("start_time") as string;
        const end = row.original.end_time;
        return (
          <span className="tabular-nums">
            {start}{end ? ` - ${end}` : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const val = row.getValue("location") as string | null;
        return val ? (
          <span className="text-sm">{val}</span>
        ) : (
          <span className="italic text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: "attendees",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Attendees" />
      ),
      cell: ({ row }) => {
        const count = (row.getValue("attendees") as unknown[])?.length || 0;
        return <span className="tabular-nums">{count}</span>;
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
          Scheduled: {
            color: "bg-blue-50 text-blue-700",
            dot: "bg-blue-500",
          },
          "In Progress": {
            color: "bg-amber-50 text-amber-700",
            dot: "bg-amber-500",
          },
          Completed: {
            color: "bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500",
          },
          Cancelled: {
            color: "bg-gray-50 text-gray-700",
            dot: "bg-gray-500",
          },
          Deleted: {
            color: "bg-rose-50 text-rose-700",
            dot: "bg-rose-500",
          },
        };
        const c = config[status] || config.Scheduled;
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
      cell: ({ row }) => <Actions meeting={row.original} />,
    },
  ];
}
