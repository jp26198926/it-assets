"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import {
  ArrowLeft,
  CheckCircle,
  Printer,
  Loader2,
  Package,
} from "lucide-react";
import {
  getReceivingById,
  completeReceiving,
} from "@/lib/actions/receiving-actions";
import {
  getReceivingItems,
  createReceivingItem,
  updateReceivingItem,
  deleteReceivingItem,
} from "@/lib/actions/receiving-item-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import { ReceivingItemFormModal } from "@/components/modals/receiving-item-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ReceivingItemDataTable } from "@/components/data-table/receiving-item-data-table";
import { createReceivingItemColumns } from "@/components/data-table/receiving-item-data-table-columns";
import { printReceiving } from "@/lib/utils/print-receiving";
import type { Receiving } from "@/lib/types/receiving";
import type { ReceivingItem, CreateReceivingItemInput } from "@/lib/types/receiving-item";
import { toast } from "sonner";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Completed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export default function ReceivingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [receiving, setReceiving] = useState<Receiving | null>(null);
  const [items, setItems] = useState<ReceivingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [printing, setPrinting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ReceivingItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ReceivingItem | null>(null);

  const [itemOptions, setItemOptions] = useState<{ id: string; name: string }[]>([]);
  const [locationOptions, setLocationOptions] = useState<{ id: string; name: string }[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [receivingData, itemsData, appSettings] = await Promise.all([
        getReceivingById(id),
        getReceivingItems(id),
        getAppSettings(),
      ]);

      if (receivingData) {
        setReceiving(receivingData);
      }

      setItems(itemsData);

      // Load item and location options
      const { getItems } = await import("@/lib/actions/item-actions");
      const allItems = await getItems();
      setItemOptions(allItems.map((i) => ({ id: i.id, name: i.name })));

      // Load locations
      const { getLocations } = await import("@/lib/actions/location-actions");
      const locs = await getLocations();
      setLocationOptions(locs.map((l: { id: string; name: string }) => ({ id: l.id, name: l.name })));
    } catch {
      toast.error("Failed to load receiving details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const handleEditItem = (item: ReceivingItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDeleteItem = (item: ReceivingItem) => {
    setDeleteItem(item);
  };

  const handleItemFormSubmit = async (data: CreateReceivingItemInput) => {
    try {
      if (editItem) {
        await updateReceivingItem(editItem.id, data);
        toast.success("Item updated");
      } else {
        await createReceivingItem({ ...data, receiving_id: id });
        toast.success("Item added");
      }
      const refreshed = await getReceivingItems(id);
      setItems(refreshed);
    } catch {
      toast.error("Failed to save item");
      throw new Error("Failed to save item");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteItem) {
      try {
        await deleteReceivingItem(deleteItem.id, reason || undefined);
        toast.success("Item deleted");
        setDeleteItem(null);
        const refreshed = await getReceivingItems(id);
        setItems(refreshed);
      } catch {
        toast.error("Failed to delete item");
      }
    }
  };

  const handleComplete = async () => {
    if (!receiving) return;
    if (items.filter((i) => i.status === "Active").length === 0) {
      toast.error("No active items to process");
      return;
    }

    setCompleting(true);
    try {
      await completeReceiving(id);
      toast.success("Receiving completed successfully");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete receiving");
    } finally {
      setCompleting(false);
    }
  };

  const handlePrint = async () => {
    if (!receiving) return;
    setPrinting(true);
    try {
      await printReceiving(receiving, items);
    } catch {
      toast.error("Failed to generate print");
    } finally {
      setPrinting(false);
    }
  };

  const columns = createReceivingItemColumns(handleEditItem, handleDeleteItem);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Loading...</h1>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading receiving details...</p>
        </div>
      </div>
    );
  }

  if (!receiving) {
    return (
      <PageGuard pagePath="/receivings">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-[#64748b]">Receiving not found</p>
          <Button variant="outline" onClick={() => router.push("/receivings")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Receivings
          </Button>
        </div>
      </PageGuard>
    );
  }

  const sConfig = statusConfig[receiving.status] || statusConfig.Active;

  return (
    <PageGuard pagePath="/receivings">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
                {receiving.code}
              </h1>
              <p className="text-sm sm:text-base text-[#64748b] mt-1">
                Receiving Details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/receivings")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {receiving.status === "Active" && (
                <Button
                  onClick={handleComplete}
                  disabled={completing}
                  className="bg-[#059669] hover:bg-[#047857] text-white"
                >
                  {completing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Mark as Completed
                </Button>
              )}
              {receiving.status === "Completed" && (
                <Button
                  onClick={handlePrint}
                  disabled={printing}
                  variant="outline"
                >
                  {printing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="mr-2 h-4 w-4" />
                  )}
                  Print
                </Button>
              )}
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left — Main Content */}
          <div className="space-y-6">
            {/* Receiving Items */}
            <ScrollReveal delay={0.1}>
              <div className="bg-white shadow-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#1a1f36]">Received Items</h2>
                  {receiving.status === "Active" && (
                    <Button size="sm" className="bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={handleAddItem}>
                      <Package className="mr-1 h-4 w-4" />
                      Add Item
                    </Button>
                  )}
                </div>
                <ReceivingItemDataTable
                  columns={columns}
                  data={items}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              </div>
            </ScrollReveal>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <ScrollReveal delay={0.15}>
              <div className="bg-white shadow-sm rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">Receiving Info</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#64748b]">Code</p>
                    <p className="text-sm font-mono font-medium">{receiving.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">Status</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sConfig.bg} ${sConfig.text}`}>
                      <span className={`size-1.5 rounded-full ${sConfig.dot}`} />
                      {receiving.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">Date Received</p>
                    <p className="text-sm">{new Date(receiving.date_received).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">Supplier</p>
                    <p className="text-sm">{receiving.supplier_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">PO Number</p>
                    <p className="text-sm">{receiving.po_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">Invoice Number</p>
                    <p className="text-sm">{receiving.invoice_number || "N/A"}</p>
                  </div>
                  {receiving.remarks && (
                    <div>
                      <p className="text-xs text-[#64748b]">Remarks</p>
                      <p className="text-sm">{receiving.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <ReceivingItemFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          item={editItem}
          receivingId={id}
          itemOptions={itemOptions}
          locationOptions={locationOptions}
          onSubmit={handleItemFormSubmit}
        />

        <DeleteConfirmModal
          open={!!deleteItem}
          onOpenChange={(open) => !open && setDeleteItem(null)}
          assetName={deleteItem?.code || ""}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageGuard>
  );
}
