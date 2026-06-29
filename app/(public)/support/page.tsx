"use client";

import Link from "next/link";
import { TicketPlus, Search, HeadphonesIcon } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function SupportLandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeadphonesIcon className="h-6 w-6 text-[#3b82f6]" />
            <span className="text-lg font-semibold text-[#1a1f36] hidden sm:inline">IT Support Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#64748b] hover:text-[#3b82f6] transition-colors">
              Login
            </Link>
            <Link href="/register" className="text-sm bg-[#3b82f6] text-white px-4 py-2 rounded-lg hover:bg-[#2563eb] transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full space-y-8">
          <ScrollReveal>
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1f36]">
                How can we help you?
              </h1>
              <p className="text-[#64748b] text-lg">
                Choose an option below to get started
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-6">
              <Link href="/support/submit" className="block group h-full">
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 text-center space-y-4 transition-all hover:shadow-lg hover:border-[#3b82f6]/30 hover:-translate-y-1 h-full">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#eff6ff] flex items-center justify-center group-hover:bg-[#3b82f6] transition-colors">
                    <TicketPlus className="h-8 w-8 text-[#3b82f6] group-hover:text-white transition-colors" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1a1f36]">Submit a Ticket</h2>
                  <p className="text-[#64748b] text-sm">
                    Report an issue or request assistance from our IT team
                  </p>
                </div>
              </Link>

              <Link href="/support/track" className="block group h-full">
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 text-center space-y-4 transition-all hover:shadow-lg hover:border-[#3b82f6]/30 hover:-translate-y-1 h-full">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center group-hover:bg-[#22c55e] transition-colors">
                    <Search className="h-8 w-8 text-[#22c55e] group-hover:text-white transition-colors" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1a1f36]">Track Your Ticket</h2>
                  <p className="text-[#64748b] text-sm">
                    Check the status of an existing support ticket
                  </p>
                </div>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
