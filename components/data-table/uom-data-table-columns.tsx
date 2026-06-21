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
import type { UOM } from "@/lib/types/uom";
import { DataTableColumnHeader } from "./data-table-column-header";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Deleted: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  uom: UOM;
  onView: (uom: UOM) => void;
  onEdit: (uom: UOM) => void;
  onDelete: (uom: UOM) => void;
  onRestore: (uom: UOM) => void;
}

function Actions({ uom, onView, onEdit, onDelete, onRestore }: ActionsProps) {
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/uoms", "Edit");
  const canDelete = hasPermission("/uoms", "Delete");
  const canRestore = hasPermission("/uoms", "Restore");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(uom)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View Details
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(uom)} className="cursor-pointer gap-2 text-[#1a1f36]">
            <Edit className="h-4 w-4 text-[#64748b]" />
            Edit UOM
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!uom.deleted_at ? (
          canDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(uom)}
              className="cursor-pointer gap-2 text-[#dc2626]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )
        ) : (
          canRestore && (
            <DropdownMenuItem
              onClick={() => onRestore(uom)}
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

export function createUOMColumns(
  onView: (uom: UOM) => void,
  onEdit: (uom: UOM) => void,
  onDelete: (uom: UOM) => void,
  onRestore: (uom: UOM) => void
): ColumnDef<UOM>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-[#1a1f36]">{row.getValue("code")}</span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-[#1a1f36]">{row.getValue("name")}</span>
      ),
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
          uom={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ),
    },
  ];
}
