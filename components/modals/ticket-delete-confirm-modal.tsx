"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface TicketDeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketNo: string;
  onConfirm: (reason: string) => void;
}

export function TicketDeleteConfirmModal({
  open,
  onOpenChange,
  ticketNo,
  onConfirm,
}: TicketDeleteConfirmModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center bg-red-50">
            <AlertTriangle className="size-6 text-red-600" />
          </div>
          <AlertDialogTitle className="text-center text-lg">
            Delete Ticket
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to delete ticket <strong className="text-foreground">{ticketNo}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-reason">Delete Reason (Optional)</Label>
          <Textarea
            id="delete-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for deletion..."
            rows={3}
          />
        </div>
        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <AlertDialogCancel className="w-full sm:w-auto" onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
