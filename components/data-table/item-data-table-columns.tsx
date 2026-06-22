"use client";

import { type ColumnDef } from "@tanstack/react-table";
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
import type { Item } from "@/lib/types/item";
import { DataTableColumnHeader } from "./data-table-column-header";

const statusConfig: Record<string, { color: string; dot: string }> = {
  Active: { color: "bg-[#d1fae5] text-[#059669]", dot: "bg-[#059669]" },
  Deleted: { color: "bg-[#fee2e2] text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface ActionsProps {
  item: Item;
  onView: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onRestore: (item: Item) => void;
}

function Actions({ item, onView, onEdit, onDelete, onRestore }: ActionsProps) {
  const { hasPermission } = useAuthorization();
  const canEdit = hasPermission("/items", "Edit");
  const canDelete = hasPermission("/items", "Delete");
  const canRestore = hasPermission("/items", "Restore");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-[#f0f4f8]">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-[#64748b]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 border-0 shadow-lg">
        <DropdownMenuItem onClick={() => onView(item)} className="cursor-pointer gap-2 text-[#1a1f36]">
          <Eye className="h-4 w-4 text-[#64748b]" />
          View Details
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer gap-2 text-[#1a1f36]">
            <Edit className="h-4 w-4 text-[#64748b]" />
            Edit Item
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!item.deleted_at ? (
          canDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="cursor-pointer gap-2 text-[#dc2626]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )
        ) : (
          canRestore && (
            <DropdownMenuItem
              onClick={() => onRestore(item)}
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

export function createItemColumns(
  onView: (item: Item) => void,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onRestore: (item: Item) => void
): ColumnDef<Item>[] {
  return [
    {
      accessorKey: "item_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item Code" />
      ),
      cell: ({ row }) => {
        const code = row.getValue("item_code") as string | null;
        return code ? (
          <span className="font-mono text-sm text-[#1a1f36]">{code}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
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
      accessorKey: "category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("category_name") as string | undefined;
        return name ? (
          <span className="text-[#64748b]">{name}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "brand",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand" />
      ),
      cell: ({ row }) => {
        const brand = row.getValue("brand") as string | null;
        return brand ? (
          <span className="text-[#64748b]">{brand}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Model" />
      ),
      cell: ({ row }) => {
        const model = row.getValue("model") as string | null;
        return model ? (
          <span className="text-[#64748b]">{model}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "uom_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="UOM" />
      ),
      cell: ({ row }) => {
        const original = row.original as Item;
        const name = original.uom_name;
        const code = original.uom_code;
        return name ? (
          <span className="text-[#64748b]">{code ? `${code} - ${name}` : name}</span>
        ) : (
          <span className="text-[#94a3b8] italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "minimum_stock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Min Stock" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-[#1a1f36]">
          {row.getValue("minimum_stock")}
        </span>
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
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Actions
          item={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ),
    },
  ];
}
