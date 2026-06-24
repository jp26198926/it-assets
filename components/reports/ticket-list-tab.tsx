"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/utils/report-export";
import type { Ticket } from "@/lib/types/ticket";

interface TicketListTabProps {
  tickets: Ticket[];
  dateRange: { from?: string; to?: string };
}

const statusColors: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Resolved: "bg-green-100 text-green-800",
  Closed: "bg-gray-100 text-gray-800",
};

const priorityColors: Record<string, string> = {
  Low: "bg-gray-100 text-gray-800",
  Medium: "bg-blue-100 text-blue-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-red-100 text-red-800",
};

export function TicketListTab({ tickets, dateRange }: TicketListTabProps) {
  const [page, setPage] = useState(1);
  const perPage = 20;
  const totalPages = Math.ceil(tickets.length / perPage);
  const paginatedTickets = tickets.slice((page - 1) * perPage, page * perPage);

  const handleExportExcel = () => {
    const data = tickets.map((t) => ({
      ticket_no: t.ticket_no,
      title: t.title,
      name: t.name,
      email: t.email,
      assigned_to_name: t.assigned_to_name || "Unassigned",
      department_name: t.department_name || "N/A",
      category_name: t.category_name || "N/A",
      priority: t.priority,
      status: t.status,
      created_at: new Date(t.created_at).toLocaleDateString(),
    }));
    exportToExcel(data, [
      { header: "Ticket No", key: "ticket_no" },
      { header: "Title", key: "title" },
      { header: "Requestor", key: "name" },
      { header: "Email", key: "email" },
      { header: "Technician", key: "assigned_to_name" },
      { header: "Department", key: "department_name" },
      { header: "Category", key: "category_name" },
      { header: "Priority", key: "priority" },
      { header: "Status", key: "status" },
      { header: "Created At", key: "created_at" },
    ], "ticket-list-report");
  };

  const handleExportPDF = () => {
    const data = tickets.map((t) => ({
      ticket_no: t.ticket_no,
      title: t.title,
      name: t.name,
      assigned_to_name: t.assigned_to_name || "Unassigned",
      department_name: t.department_name || "N/A",
      category_name: t.category_name || "N/A",
      priority: t.priority,
      status: t.status,
      created_at: new Date(t.created_at).toLocaleDateString(),
    }));
    exportToPDF(data, [
      { header: "Ticket No", key: "ticket_no" },
      { header: "Title", key: "title" },
      { header: "Requestor", key: "name" },
      { header: "Technician", key: "assigned_to_name" },
      { header: "Department", key: "department_name" },
      { header: "Category", key: "category_name" },
      { header: "Priority", key: "priority" },
      { header: "Status", key: "status" },
      { header: "Created At", key: "created_at" },
    ], "Ticket List Report", "ticket-list-report", dateRange);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} found
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExportExcel}>
            <Download className="size-4" />
            Excel
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportPDF}>
            <Download className="size-4" />
            PDF
          </Button>
        </div>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket No</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Requestor</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No tickets found for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">{ticket.ticket_no}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{ticket.title}</TableCell>
                  <TableCell>{ticket.name}</TableCell>
                  <TableCell>{ticket.assigned_to_name || "Unassigned"}</TableCell>
                  <TableCell>{ticket.department_name || "N/A"}</TableCell>
                  <TableCell>{ticket.category_name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[ticket.status]}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
