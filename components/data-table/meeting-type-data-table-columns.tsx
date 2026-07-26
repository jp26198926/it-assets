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
import type { MeetingType } from "@/lib/types/meeting-type";

export function createMeetingTypeColumns(
  onView: (meetingType: MeetingType) => void,
  onEdit: (meetingType: MeetingType) => void,
  onDelete: (meetingType: MeetingType) => void,
  onRestore: (meetingType: MeetingType) => void,
  timezone?: string | null
): ColumnDef<MeetingType>[] {
  function Actions({ meetingType }: { meetingType: MeetingType }) {
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
          <DropdownMenuItem onClick={() => onView(meetingType)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {hasPermission("/meeting-types", "Edit") && (
            <DropdownMenuItem onClick={() => onEdit(meetingType)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Meeting Type
            </DropdownMenuItem>
          )}
          {meetingType.deleted_at ? (
            hasPermission("/meeting-types", "Restore") && (
              <DropdownMenuItem
                onClick={() => onRestore(meetingType)}
                className="text-green-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
            )
          ) : (
            hasPermission("/meeting-types", "Delete") && (
              <DropdownMenuItem
                onClick={() => onDelete(meetingType)}
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-[#1a1f36]">
          {row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const val = row.getValue("description") as string | null;
        return val ? (
          <span>{val}</span>
        ) : (
          <span className="italic text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: "color",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Color" />
      ),
      cell: ({ row }) => {
        const color = row.getValue("color") as string | null;
        if (!color) return <span className="italic text-muted-foreground">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs">{color}</span>
          </div>
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
          Active: {
            color: "bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500",
          },
          Deleted: {
            color: "bg-rose-50 text-rose-700",
            dot: "bg-rose-500",
          },
        };
        const c = config[status] || config.Active;
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
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatInAppTimezone(row.getValue("created_at"), "MMM dd, yyyy", timezone)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <Actions meetingType={row.original} />
      ),
    },
  ];
}
