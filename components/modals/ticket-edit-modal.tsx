"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Edit } from "lucide-react";
import type { Ticket } from "@/lib/types/ticket";

interface TicketEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  selectOptions: {
    categories: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    assets: { id: string; barcode: string; itemName: string }[];
  };
  onConfirm: (data: { name: string; category_id: string; department_id: string; priority: string; asset_id: string }) => void;
}

export function TicketEditModal({
  open,
  onOpenChange,
  ticket,
  selectOptions,
  onConfirm,
}: TicketEditModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [priority, setPriority] = useState("Low");
  const [assetId, setAssetId] = useState("");

  useEffect(() => {
    if (open && ticket) {
      setName(ticket.name);
      setCategoryId(ticket.category_id);
      setDepartmentId(ticket.department_id || "");
      setPriority(ticket.priority);
      setAssetId(ticket.asset_id || "");
    }
  }, [open, ticket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ name, category_id: categoryId, department_id: departmentId, priority, asset_id: assetId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col max-h-[85vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center bg-[#f0f4f8]">
              <Edit className="size-5 text-[#3b82f6]" />
            </div>
            Edit Ticket
          </DialogTitle>
        </DialogHeader>

        <form id="ticket-edit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <SearchableSelect
                value={categoryId}
                onValueChange={setCategoryId}
                options={selectOptions.categories}
                placeholder="Select category"
                searchPlaceholder="Search categories..."
              />
            </div>

            <div className="space-y-2">
              <Label>Department (Optional)</Label>
              <SearchableSelect
                value={departmentId}
                onValueChange={setDepartmentId}
                options={selectOptions.departments}
                placeholder="Select department"
                searchPlaceholder="Search departments..."
              />
            </div>

            <div className="space-y-2">
              <Label>Asset (Optional)</Label>
              <SearchableSelect
                value={assetId}
                onValueChange={setAssetId}
                options={selectOptions.assets.map((asset) => ({ id: asset.id, name: `${asset.itemName} (${asset.barcode})` }))}
                placeholder="Select asset"
                searchPlaceholder="Search assets..."
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <SearchableSelect
                value={priority}
                onValueChange={setPriority}
                options={[
                  { id: "Low", name: "Low" },
                  { id: "Medium", name: "Medium" },
                  { id: "High", name: "High" },
                  { id: "Critical", name: "Critical" },
                ]}
                placeholder="Select priority"
                searchPlaceholder="Search priorities..."
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="ticket-edit-form">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
