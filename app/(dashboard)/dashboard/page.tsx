"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { useAuthorization } from "@/hooks/use-authorization";
import { fetchDashboardStats } from "@/lib/actions/dashboard-actions";
import type { DashboardStats } from "@/lib/types/dashboard";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  Users,
  Ticket,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Available: "#10b981",
  Assigned: "#3b82f6",
  Repair: "#f59e0b",
  Lost: "#ef4444",
  Disposed: "#6b7280",
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

const PRIORITY_BADGE: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-orange-50 text-orange-700",
  Critical: "bg-red-50 text-red-700",
};

const TICKET_STATUS_BADGE: Record<string, string> = {
  Open: "bg-blue-50 text-blue-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-gray-50 text-gray-600",
};

const ASSET_STATUS_BADGE: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Assigned: "bg-blue-50 text-blue-700",
  Repair: "bg-amber-50 text-amber-700",
  Lost: "bg-red-50 text-red-700",
  Disposed: "bg-gray-50 text-gray-600",
};

function StatCardSkeleton() {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <Skeleton className="size-10 sm:size-12 rounded-lg" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="mt-3 sm:mt-4 space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader className="px-6 py-4">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader className="px-6 py-4">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="p-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { hasPermission, isLoading: authLoading } = useAuthorization();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const canViewAssets = hasPermission("/assets", "View");
  const canViewTickets = hasPermission("/tickets", "View");
  const canViewAssignments = hasPermission("/assignments", "View");
  const canViewTicketReport = hasPermission("/ticket-report", "View");

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isLoading = loading || authLoading;

  return (
    <PageGuard pagePath="/dashboard">
      <div className="space-y-6 sm:space-y-8">
        <ScrollReveal>
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] lg:text-3xl">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-[#64748b] mt-1">
                Overview of your IT assets, tickets, and assignments
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : (
              <>
                {canViewAssets && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex size-10 sm:size-12 items-center justify-center bg-blue-50">
                            <Package className="size-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4">
                          <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1f36]">
                            {stats?.assets.total.toLocaleString() ?? 0}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#64748b] mt-1">Total Assets</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {canViewAssets && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex size-10 sm:size-12 items-center justify-center bg-emerald-50">
                            <CheckCircle className="size-6 text-emerald-600" />
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4">
                          <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1f36]">
                            {stats?.assets.available.toLocaleString() ?? 0}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#64748b] mt-1">Available Assets</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {canViewTickets && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex size-10 sm:size-12 items-center justify-center bg-amber-50">
                            <AlertTriangle className="size-6 text-amber-600" />
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4">
                          <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1f36]">
                            {stats?.tickets.open.toLocaleString() ?? 0}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#64748b] mt-1">Open Tickets</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {canViewAssignments && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex size-10 sm:size-12 items-center justify-center bg-purple-50">
                            <Users className="size-6 text-purple-600" />
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4">
                          <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1f36]">
                            {stats?.assignments.active.toLocaleString() ?? 0}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#64748b] mt-1">Active Assignments</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
        </div>

        {/* Charts Row */}
        {canViewAssets && (
          <div className="grid gap-6 lg:grid-cols-2">
            {isLoading ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              <>
                <ScrollReveal>
                  <Card className="border-0 bg-white shadow-sm rounded-xl">
                    <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                      <CardTitle className="text-lg font-semibold text-[#1a1f36]">
                        Assets by Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-4">
                      {stats && stats.assets.total > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Available", value: stats.assets.available },
                                { name: "Assigned", value: stats.assets.assigned },
                                { name: "Repair", value: stats.assets.repair },
                                { name: "Lost", value: stats.assets.lost },
                                { name: "Disposed", value: stats.assets.disposed },
                              ].filter((d) => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {[
                                { name: "Available", value: stats.assets.available },
                                { name: "Assigned", value: stats.assets.assigned },
                                { name: "Repair", value: stats.assets.repair },
                                { name: "Lost", value: stats.assets.lost },
                                { name: "Disposed", value: stats.assets.disposed },
                              ]
                                .filter((d) => d.value > 0)
                                .map((entry) => (
                                  <Cell
                                    key={entry.name}
                                    fill={STATUS_COLORS[entry.name] || "#6b7280"}
                                  />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-[#64748b]">
                          No asset data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ScrollReveal>

                <ScrollReveal>
                  <Card className="border-0 bg-white shadow-sm rounded-xl">
                    <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                      <CardTitle className="text-lg font-semibold text-[#1a1f36]">
                        Assets by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-4">
                      {stats && stats.assetByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart
                            data={stats.assetByCategory}
                            layout="vertical"
                            margin={{ left: 10, right: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              tick={{ fontSize: 12 }}
                              width={120}
                            />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-[#64748b]">
                          No category data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ScrollReveal>
              </>
            )}
          </div>
        )}

        {/* Ticket Charts Row */}
        {canViewTickets && (
          <div className="grid gap-6 lg:grid-cols-2">
            {isLoading ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              <>
                <ScrollReveal>
                  <Card className="border-0 bg-white shadow-sm rounded-xl">
                    <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                      <CardTitle className="text-lg font-semibold text-[#1a1f36]">
                        Tickets by Priority
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-4">
                      {stats && stats.tickets.total > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={stats.ticketByPriority.filter((d) => d.count > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="count"
                              nameKey="name"
                            >
                              {stats.ticketByPriority
                                .filter((d) => d.count > 0)
                                .map((entry) => (
                                  <Cell
                                    key={entry.name}
                                    fill={STATUS_COLORS[entry.name] || "#6b7280"}
                                  />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-[#64748b]">
                          No ticket data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ScrollReveal>

                <ScrollReveal>
                  <Card className="border-0 bg-white shadow-sm rounded-xl">
                    <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                      <CardTitle className="text-lg font-semibold text-[#1a1f36]">
                        Ticket Trend (30 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-4">
                      {stats && stats.ticketTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <AreaChart data={stats.ticketTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 11 }}
                              tickFormatter={(v: string) => {
                                const d = new Date(v);
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                              }}
                            />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                              labelFormatter={(label) =>
                                format(new Date(String(label)), "MMM dd, yyyy")
                              }
                            />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.1}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-[#64748b]">
                          No ticket trend data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ScrollReveal>
              </>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {isLoading ? (
            <>
              <ActivitySkeleton />
              <ActivitySkeleton />
            </>
          ) : (
            <>
              {canViewAssets && (
                <ScrollReveal>
                  <Card className="border-0 bg-white shadow-sm rounded-xl">
                    <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-[#1a1f36]">
                          Recent Assets
                        </CardTitle>
                        <Link
                          href="/assets"
                          className="text-sm font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors flex items-center gap-1"
                        >
                          View All <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-[#f0f4f8]">
                        {stats && stats.recentAssets.length > 0 ? (
                          stats.recentAssets.map((asset, index) => (
                            <motion.div
                              key={asset.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#f8fafc]"
                            >
                              <div className="flex size-10 items-center justify-center bg-blue-50 text-blue-600">
                                <Package className="size-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#1a1f36] truncate">
                                  {asset.item_name}
                                </p>
                                <p className="text-xs text-[#64748b]">
                                  {asset.barcode} &bull; {asset.location_name}
                                </p>
                              </div>
                              <span
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                  ASSET_STATUS_BADGE[asset.status] || "bg-gray-50 text-gray-600"
                                }`}
                              >
                                {asset.status}
                              </span>
                            </motion.div>
                          ))
                        ) : (
                          <div className="px-6 py-8 text-center text-sm text-[#64748b]">
                            No assets found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )}

              {canViewTickets && (
                <ScrollReveal>
                  <Card className="border-0 bg-white shadow-sm rounded-xl">
                    <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-[#1a1f36]">
                          Recent Tickets
                        </CardTitle>
                        <Link
                          href="/tickets"
                          className="text-sm font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors flex items-center gap-1"
                        >
                          View All <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-[#f0f4f8]">
                        {stats && stats.recentTickets.length > 0 ? (
                          stats.recentTickets.map((ticket, index) => (
                            <motion.div
                              key={ticket.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#f8fafc]"
                            >
                              <div className="flex size-10 items-center justify-center bg-amber-50 text-amber-600">
                                <Ticket className="size-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#1a1f36] truncate">
                                  {ticket.title}
                                </p>
                                <p className="text-xs text-[#64748b]">
                                  {ticket.ticket_no} &bull; {ticket.assigned_to_name}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                    PRIORITY_BADGE[ticket.priority] || "bg-gray-50 text-gray-600"
                                  }`}
                                >
                                  {ticket.priority}
                                </span>
                                <span
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                    TICKET_STATUS_BADGE[ticket.status] || "bg-gray-50 text-gray-600"
                                  }`}
                                >
                                  {ticket.status}
                                </span>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="px-6 py-8 text-center text-sm text-[#64748b]">
                            No tickets found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <ScrollReveal>
          <Card className="border-0 bg-white shadow-sm rounded-xl">
            <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
              <CardTitle className="text-lg font-semibold text-[#1a1f36]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {canViewAssets && (
                  <Link
                    href="/assets"
                    className="flex items-center gap-4 p-3 transition-all duration-200 hover:bg-[#f8fafc] group rounded-lg"
                  >
                    <div className="flex size-10 items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                      <Package className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1f36]">View Assets</p>
                      <p className="text-xs text-[#64748b]">Browse inventory</p>
                    </div>
                  </Link>
                )}
                {canViewTickets && (
                  <Link
                    href="/tickets"
                    className="flex items-center gap-4 p-3 transition-all duration-200 hover:bg-[#f8fafc] group rounded-lg"
                  >
                    <div className="flex size-10 items-center justify-center bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                      <Ticket className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1f36]">View Tickets</p>
                      <p className="text-xs text-[#64748b]">Manage helpdesk</p>
                    </div>
                  </Link>
                )}
                {canViewAssignments && (
                  <Link
                    href="/assignments"
                    className="flex items-center gap-4 p-3 transition-all duration-200 hover:bg-[#f8fafc] group rounded-lg"
                  >
                    <div className="flex size-10 items-center justify-center bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                      <Users className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1f36]">Assignments</p>
                      <p className="text-xs text-[#64748b]">Track assignments</p>
                    </div>
                  </Link>
                )}
                {canViewTicketReport && (
                  <Link
                    href="/ticket-report"
                    className="flex items-center gap-4 p-3 transition-all duration-200 hover:bg-[#f8fafc] group rounded-lg"
                  >
                    <div className="flex size-10 items-center justify-center bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                      <BarChart3 className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1f36]">Ticket Report</p>
                      <p className="text-xs text-[#64748b]">Analytics & insights</p>
                    </div>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </PageGuard>
  );
}
