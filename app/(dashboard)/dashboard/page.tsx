"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { mockAssets } from "@/lib/mock-data";
import { Eye, ShoppingCart, Package, Users, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
  {
    title: "Total Assets",
    value: mockAssets.length.toLocaleString(),
    icon: Eye,
    change: "0.43%",
    changeType: "up" as const,
    color: "text-[#3b82f6]",
    bg: "bg-[#e8f0fe]",
  },
  {
    title: "Active",
    value: mockAssets.filter((a) => a.status === "Active").length.toLocaleString(),
    icon: ShoppingCart,
    change: "4.35%",
    changeType: "up" as const,
    color: "text-[#3b82f6]",
    bg: "bg-[#e8f0fe]",
  },
  {
    title: "In Maintenance",
    value: mockAssets.filter((a) => a.status === "Maintenance").length.toLocaleString(),
    icon: Package,
    change: "2.59%",
    changeType: "up" as const,
    color: "text-[#3b82f6]",
    bg: "bg-[#e8f0fe]",
  },
  {
    title: "Retired",
    value: mockAssets.filter((a) => a.status === "Retired").length.toLocaleString(),
    icon: Users,
    change: "0.95%",
    changeType: "down" as const,
    color: "text-[#3b82f6]",
    bg: "bg-[#e8f0fe]",
  },
];

export default function DashboardPage() {
  return (
    <PageGuard pagePath="/dashboard">
      <div className="space-y-6 sm:space-y-8">
        <ScrollReveal>
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] lg:text-3xl">Dashboard</h1>
              <p className="text-sm sm:text-base text-[#64748b] mt-1">
                Overview of your IT asset inventory
              </p>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className={`flex size-10 sm:size-12 items-center justify-center ${stat.bg}`}>
                      <Icon className={`size-6 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      stat.changeType === "up" ? "text-[#10b981]" : "text-[#ef4444]"
                    }`}>
                      {stat.changeType === "up" ? (
                        <ArrowUp className="size-4" />
                      ) : (
                        <ArrowDown className="size-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1f36]">{stat.value}</h3>
                    <p className="text-xs sm:text-sm text-[#64748b] mt-1">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ScrollReveal className="lg:col-span-2">
          <Card className="border-0 bg-white shadow-sm rounded-xl">
            <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Recent Activity</CardTitle>
                <Link href="/assets" className="text-sm font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#f0f4f8]">
                {mockAssets.slice(0, 5).map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#f8fafc]"
                  >
                    <div className={`flex size-10 items-center justify-center ${
                      asset.status === "Active" ? "bg-[#d1fae5] text-[#059669]" :
                      asset.status === "In Use" ? "bg-[#e8f0fe] text-[#3b82f6]" :
                      asset.status === "Maintenance" ? "bg-[#fef3c7] text-[#d97706]" :
                      "bg-[#f0f4f8] text-[#64748b]"
                    }`}>
                      <Package className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1a1f36] truncate">{asset.name}</p>
                      <p className="text-xs text-[#64748b]">
                        {asset.assetTag} • {asset.location}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1.5 ${
                      asset.status === "Active" ? "bg-[#d1fae5] text-[#059669]" :
                      asset.status === "In Use" ? "bg-[#e8f0fe] text-[#3b82f6]" :
                      asset.status === "Maintenance" ? "bg-[#fef3c7] text-[#d97706]" :
                      asset.status === "Available" ? "bg-[#ede9fe] text-[#7c3aed]" :
                      "bg-[#fee2e2] text-[#dc2626]"
                    }`}>
                      {asset.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal>
          <Card className="border-0 bg-white shadow-sm rounded-xl">
            <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
              <CardTitle className="text-lg font-semibold text-[#1a1f36]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Link
                  href="/assets"
                  className="flex items-center gap-4 p-3 transition-all duration-200 hover:bg-[#f8fafc] group"
                >
                  <div className="flex size-10 items-center justify-center bg-[#e8f0fe] text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white transition-colors duration-200">
                    <Package className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1f36]">View All Assets</p>
                    <p className="text-xs text-[#64748b]">Browse complete inventory</p>
                  </div>
                </Link>
                <Link
                  href="/assets"
                  className="flex items-center gap-4 p-3 transition-all duration-200 hover:bg-[#f8fafc] group"
                >
                  <div className="flex size-10 items-center justify-center bg-[#d1fae5] text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors duration-200">
                    <Eye className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1f36]">Add New Asset</p>
                    <p className="text-xs text-[#64748b]">Register new inventory</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/reports"
                  className="flex items-center gap-4 p-3 transition-all duration-200 hover:bg-[#f8fafc] group"
                >
                  <div className="flex size-10 items-center justify-center bg-[#fef3c7] text-[#d97706] group-hover:bg-[#d97706] group-hover:text-white transition-colors duration-200">
                    <ShoppingCart className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1f36]">View Reports</p>
                    <p className="text-xs text-[#64748b]">Analytics and insights</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/users"
                  className="flex items-center gap-4 p-3 transition-all duration-200 hover:bg-[#f8fafc] group"
                >
                  <div className="flex size-10 items-center justify-center bg-[#ede9fe] text-[#7c3aed] group-hover:bg-[#7c3aed] group-hover:text-white transition-colors duration-200">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1f36]">Manage Users</p>
                    <p className="text-xs text-[#64748b]">User assignments</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
      </div>
    </PageGuard>
  );
}
