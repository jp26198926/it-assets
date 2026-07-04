"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
  ColumnDef,
  FilterMeta,
} from "@tanstack/react-table";
import { FileStack } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { MeetingTypeDataTableToolbar } from "./meeting-type-data-table-toolbar";
import type { MeetingType, MeetingTypeAdvancedFilter } from "@/lib/types/meeting-type";

interface MeetingTypeDataTableProps {
  columns: ColumnDef<MeetingType, unknown>[];
  data: MeetingType[];
  onView: (meetingType: MeetingType) => void;
  onEdit: (meetingType: MeetingType) => void;
  onDelete: (meetingType: MeetingType) => void;
  onRestore: (meetingType: MeetingType) => void;
  onAdd: () => void;
  onServerSearch?: (filters: { search?: string }) => void;
  onServerSearchClear?: () => void;
}

export function MeetingTypeDataTable({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onAdd,
  onServerSearch,
  onServerSearchClear,
}: MeetingTypeDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<MeetingTypeAdvancedFilter[]>([]);

  const filteredData = useMemo(() => {
    if (advancedFilters.length === 0) return data;
    return data.filter((item) =>
      advancedFilters.every((filter) => {
        const fieldValue = item[filter.field];
        if (fieldValue === null || fieldValue === undefined) return false;
        const strValue = String(fieldValue).toLowerCase();
        const filterValue = filter.value.toLowerCase();
        switch (filter.operator) {
          case "equals":
            return strValue === filterValue;
          case "contains":
            return strValue.includes(filterValue);
          case "greaterThan":
            return strValue > filterValue;
          case "lessThan":
            return strValue < filterValue;
          case "startsWith":
            return strValue.startsWith(filterValue);
          default:
            return true;
        }
      })
    );
  }, [data, advancedFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue(columnId);
      if (cellValue === null || cellValue === undefined) return false;
      return String(cellValue)
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
  });

  return (
    <div className="space-y-4">
      <MeetingTypeDataTableToolbar
        table={table}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
        onAdd={onAdd}
        onServerSearch={onServerSearch}
        onServerSearchClear={onServerSearchClear}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={setAdvancedFilters}
        allData={data}
      />
      <div className="hidden lg:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-[#3b82f6] text-white"
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header &&
                        typeof header.column.columnDef.header === "function"
                      ? header.column.columnDef.header(header.getContext())
                      : header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-[#f8fafc]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {typeof cell.column.columnDef.cell === "function"
                        ? cell.column.columnDef.cell(cell.getContext())
                        : cell.getValue()}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileStack className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs text-muted-foreground">
                        No meeting types match your search.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="lg:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const item = row.original;
            return (
              <div
                key={row.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-lg">
                      {item.color ? (
                        <span
                          className="inline-block h-4 w-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      ) : (
                        "🏷️"
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a1f36]">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(item)}
                      className="p-2 hover:bg-muted rounded-md"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 hover:bg-muted rounded-md"
                    >
                      ✏️
                    </button>
                    {item.deleted_at ? (
                      <button
                        onClick={() => onRestore(item)}
                        className="p-2 hover:bg-muted rounded-md"
                      >
                        ♻️
                      </button>
                    ) : (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 hover:bg-muted rounded-md"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <FileStack className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No results found</p>
            <p className="text-xs text-muted-foreground">
              No meeting types match your search.
            </p>
          </div>
        )}
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
