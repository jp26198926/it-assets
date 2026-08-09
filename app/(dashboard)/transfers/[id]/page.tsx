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
  getTransferById,
  completeTransfer,
} from "@/lib/actions/transfer-actions";
import {
  getTransferItems,
  createTransferItem,
  updateTransferItem,
  deleteTransferItem,
} from "@/lib/actions/transfer-item-actions";
import { getAppSettings } from "@/lib/actions/application-actions";
import { TransferItemFormModal } from "@/components/modals/transfer-item-form-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { TransferItemDataTable } from "@/components/data-table/transfer-item-data-table";
import { createTransferItemColumns } from "@/components/data-table/transfer-item-data-table-columns";
import { printTransfer } from "@/lib/utils/print-transfer";
import type { Transfer } from "@/lib/types/transfer";
import type { TransferItem, CreateTransferItemInput } from "@/lib/types/transfer-item";
import { toast } from "sonner";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Completed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export default function TransferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [items, setItems] = useState<TransferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [printing, setPrinting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<TransferItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<TransferItem | null>(null);

  const [itemOptions, setItemOptions] = useState<{ id: string; name: string; uom_name?: string; category_name?: string }[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [transferData, itemsData] = await Promise.all([
        getTransferById(id),
        getTransferItems(id),
      ]);

      if (transferData) {
        setTransfer(transferData);
      }

      setItems(itemsData);

      // Load item options
      const { getItems } = await import("@/lib/actions/item-actions");
      const allItems = await getItems({ status: "Active" });
      setItemOptions(allItems.map((i) => ({
        id: i.id,
        name: i.name,
        uom_name: i.uom_name,
        category_name: i.category_name,
      })));
    } catch {
      toast.error("Failed to load transfer details");
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

  const handleEditItem = (item: TransferItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDeleteItem = (item: TransferItem) => {
    setDeleteItem(item);
  };

  const handleItemFormSubmit = async (data: CreateTransferItemInput) => {
    try {
      if (editItem) {
        await updateTransferItem(editItem.id, data);
        toast.success("Item updated");
      } else {
        await createTransferItem({ ...data, transfer_id: id });
        toast.success("Item added");
      }
      const refreshed = await getTransferItems(id);
      setItems(refreshed);
    } catch {
      toast.error("Failed to save item");
      throw new Error("Failed to save item");
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (deleteItem) {
      try {
        await deleteTransferItem(deleteItem.id, reason || undefined);
        toast.success("Item deleted");
        setDeleteItem(null);
        const refreshed = await getTransferItems(id);
        setItems(refreshed);
      } catch {
        toast.error("Failed to delete item");
      }
    }
  };

  const handleComplete = async () => {
    if (!transfer) return;
    if (items.filter((i) => i.status === "Active").length === 0) {
      toast.error("No active items to process");
      return;
    }

    setCompleting(true);
    try {
      await completeTransfer(id);
      toast.success("Transfer completed successfully");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete transfer");
    } finally {
      setCompleting(false);
    }
  };

  const handlePrint = async () => {
    if (!transfer) return;
    setPrinting(true);
    try {
      await printTransfer(transfer, items);
    } catch {
      toast.error("Failed to generate print");
    } finally {
      setPrinting(false);
    }
  };

  const columns = createTransferItemColumns(handleEditItem, handleDeleteItem);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Loading...</h1>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading transfer details...</p>
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <PageGuard pagePath="/transfers">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-[#64748b]">Transfer not found</p>
          <Button variant="outline" onClick={() => router.push("/transfers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transfers
          </Button>
        </div>
      </PageGuard>
    );
  }

  const sConfig = statusConfig[transfer.status] || statusConfig.Active;

  return (
    <PageGuard pagePath="/transfers">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">
                {transfer.code}
              </h1>
              <p className="text-sm sm:text-base text-[#64748b] mt-1">
                Transfer Details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/transfers")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {transfer.status === "Active" && (
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
              {transfer.status === "Completed" && (
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
            {/* Transfer Items */}
            <ScrollReveal delay={0.1}>
              <div className="bg-white shadow-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#1a1f36]">Transfer Items</h2>
                  {transfer.status === "Active" && (
                    <Button size="sm" className="bg-[#3b82f6] hover:bg-[#2563eb] text-white" onClick={handleAddItem}>
                      <Package className="mr-1 h-4 w-4" />
                      Add Item
                    </Button>
                  )}
                </div>
                <TransferItemDataTable
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
                <h3 className="text-sm font-semibold text-[#1a1f36] uppercase tracking-wide">Transfer Info</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#64748b]">Code</p>
                    <p className="text-sm font-mono font-medium">{transfer.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">Status</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sConfig.bg} ${sConfig.text}`}>
                      <span className={`size-1.5 rounded-full ${sConfig.dot}`} />
                      {transfer.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">Date Transferred</p>
                    <p className="text-sm">{new Date(transfer.date_transferred).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">From Location</p>
                    <p className="text-sm">{transfer.from_location_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">To Location</p>
                    <p className="text-sm">{transfer.to_location_name || "N/A"}</p>
                  </div>
                  {transfer.remarks && (
                    <div>
                      <p className="text-xs text-[#64748b]">Remarks</p>
                      <p className="text-sm">{transfer.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <TransferItemFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          item={editItem}
          transferId={id}
          fromLocationId={transfer?.from_location_id || ""}
          itemOptions={itemOptions}
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
