"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/scroll-reveal";
import { format } from "date-fns";

interface TicketData {
  id: string;
  ticket_no: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category_name?: string;
  department_name?: string;
  asset_name?: string;
  created_at: string;
  updated_at: string | null;
}

const statusColors: Record<string, string> = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
  Deleted: "bg-red-100 text-red-700",
};

const priorityColors: Record<string, string> = {
  Low: "bg-gray-100 text-gray-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

export default function TrackTicketPage() {
  const [ticketNo, setTicketNo] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNo.trim() || !email.trim()) {
      setError("Please enter both ticket number and email");
      return;
    }
    setLoading(true);
    setError("");
    setTicket(null);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/public/tickets/track?ticket_no=${encodeURIComponent(ticketNo.trim())}&email=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();
      if (data.success && data.data) {
        setTicket(data.data);
      } else {
        setError(data.error || "Ticket not found. Please check your ticket number and email.");
      }
    } catch {
      setError("Failed to look up ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/support" className="text-sm text-[#64748b] hover:text-[#3b82f6] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Support Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <ScrollReveal>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1f36]">Track Your Ticket</h1>
              <p className="text-[#64748b] mt-1">
                Enter your ticket number and email to check the status.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket_no">Ticket Number</Label>
                  <Input
                    id="ticket_no"
                    value={ticketNo}
                    onChange={(e) => setTicketNo(e.target.value)}
                    placeholder="TK-000001"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Track Ticket
              </Button>
            </form>
          </ScrollReveal>

          {error && searched && (
            <ScrollReveal>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </ScrollReveal>
          )}

          {ticket && (
            <ScrollReveal>
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#64748b]">Ticket Number</p>
                    <p className="text-lg font-mono font-bold text-[#3b82f6]">{ticket.ticket_no}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status] || "bg-gray-100 text-gray-600"}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority] || "bg-gray-100 text-gray-600"}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[#64748b]">Title</p>
                  <p className="font-medium text-[#1a1f36]">{ticket.title}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {ticket.category_name && (
                    <div>
                      <p className="text-sm text-[#64748b]">Category</p>
                      <p className="text-[#1a1f36]">{ticket.category_name}</p>
                    </div>
                  )}
                  {ticket.department_name && (
                    <div>
                      <p className="text-sm text-[#64748b]">Department</p>
                      <p className="text-[#1a1f36]">{ticket.department_name}</p>
                    </div>
                  )}
                  {ticket.asset_name && (
                    <div>
                      <p className="text-sm text-[#64748b]">Asset</p>
                      <p className="text-[#1a1f36]">{ticket.asset_name}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-[#64748b] mb-2">Description</p>
                  <div
                    className="prose prose-sm max-w-none text-[#1a1f36]"
                    dangerouslySetInnerHTML={{ __html: ticket.description }}
                  />
                </div>

                <div className="border-t pt-4 grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-[#64748b]">
                    <Clock className="h-4 w-4" />
                    <span>Created: {format(new Date(ticket.created_at), "MMM dd, yyyy 'at' h:mm a")}</span>
                  </div>
                  {ticket.updated_at && (
                    <div className="flex items-center gap-2 text-[#64748b]">
                      <Clock className="h-4 w-4" />
                      <span>Updated: {format(new Date(ticket.updated_at), "MMM dd, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="bg-[#f8fafc] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm text-[#64748b]">
                      Need to reply or update this ticket?
                    </p>
                    <Link href="/login">
                      <Button size="sm">Login to Reply</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </main>
    </div>
  );
}
