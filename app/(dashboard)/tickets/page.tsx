"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TicketDataTable } from "@/components/data-table/ticket-data-table";
import { createTicketColumns } from "@/components/data-table/ticket-data-table-columns";
import { TicketFormModal } from "@/components/modals/ticket-form-modal";
import { TicketDeleteConfirmModal } from "@/components/modals/ticket-delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { useAuthorization } from "@/hooks/use-authorization";
import {
  getTickets,
  createTicket,
  deleteTicket,
  restoreTicket,
  getTicketSelectOptions,
} from "@/lib/actions/ticket-actions";
import type { Ticket, TicketFilters } from "@/lib/types/ticket";
import { toast } from "sonner";

export default function TicketsPage() {
  const router = useRouter();
  const { user: authUser } = useAuthorization();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [deleteTicketItem, setDeleteTicketItem] = useState<Ticket | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<TicketFilters>({});
  const [selectOptions, setSelectOptions] = useState<{
    categories: { id: string; name: string }[];
    assets: { id: string; barcode: string; itemName: string }[];
    users: { id: string; name: string }[];
  }>({ categories: [], assets: [], users: [] });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [ticketsData, options] = await Promise.all([
          getTickets(),
          getTicketSelectOptions(),
        ]);
        if (!cancelled) {
          setTickets(ticketsData);
          setSelectOptions(options);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load tickets");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleServerSearch = useCallback((filters: TicketFilters) => {
    setActiveFilters(filters);
    getTickets(filters)
      .then((data) => setTickets(data))
      .catch(() => {
        toast.error("Failed to search tickets");
      });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getTickets()
      .then((data) => setTickets(data))
      .catch(() => {
        toast.error("Failed to load tickets");
      });
  }, []);

  const handleView = (ticket: Ticket) => {
    router.push(`/tickets/${ticket.id}`);
  };

  const handleDelete = (ticket: Ticket) => {
    setDeleteTicketItem(ticket);
  };

  const handleRestore = async (ticket: Ticket) => {
    try {
      await restoreTicket(ticket.id);
      toast.success(`${ticket.ticket_no} has been restored`);
      const data = await getTickets(activeFilters);
      setTickets(data);
    } catch {
      toast.error("Failed to restore ticket");
    }
  };

  const handleAdd = () => {
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: Parameters<typeof createTicket>[0]) => {
    try {
      await createTicket(data);
      toast.success(`${data.title} has been created`);
      const refreshed = await getTickets(activeFilters);
      setTickets(refreshed);
    } catch {
      toast.error("Failed to save ticket");
      throw new Error("Failed to save ticket");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteTicketItem) {
      try {
        await deleteTicket(deleteTicketItem.id, reason || undefined);
        toast.success(`${deleteTicketItem.ticket_no} has been deleted`);
        setDeleteTicketItem(null);
        const refreshed = await getTickets(activeFilters);
        setTickets(refreshed);
      } catch {
        toast.error("Failed to delete ticket");
      }
    }
  };

  const columns = createTicketColumns(handleView, handleDelete, handleRestore);

  const currentUser = authUser
    ? {
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        email: authUser.email,
      }
    : null;

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Tickets
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage support tickets
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/tickets">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
              Tickets
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage support tickets
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <TicketDataTable
            columns={columns}
            data={tickets}
            onView={handleView}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
            onServerSearch={handleServerSearch}
            onServerSearchClear={handleServerSearchClear}
          />
        </ScrollReveal>

        <TicketFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          selectOptions={selectOptions}
          currentUser={currentUser}
        />

        <TicketDeleteConfirmModal
          open={!!deleteTicketItem}
          onOpenChange={(open) => !open && setDeleteTicketItem(null)}
          ticketNo={deleteTicketItem?.ticket_no || ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
