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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

interface TicketAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: { id: string; name: string }[];
  currentAssignedTo: string | null;
  onConfirm: (userId: string) => void;
}

export function TicketAssignModal({
  open,
  onOpenChange,
  users,
  currentAssignedTo,
  onConfirm,
}: TicketAssignModalProps) {
  const [assignedTo, setAssignedTo] = useState(currentAssignedTo || "none");

  useEffect(() => {
    if (open) {
      setAssignedTo(currentAssignedTo || "none");
    }
  }, [open, currentAssignedTo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(assignedTo === "none" ? "" : assignedTo);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col max-h-[85vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center bg-[#f0f4f8]">
              <UserPlus className="size-5 text-[#3b82f6]" />
            </div>
            Assign Ticket
          </DialogTitle>
        </DialogHeader>

        <form id="ticket-assign-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="ticket-assign-form">
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
