"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Employee } from "@/lib/types/employee";

interface EmployeeViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Deleted: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export function EmployeeViewModal({
  open,
  onOpenChange,
  employee,
}: EmployeeViewModalProps) {
  if (!employee) return null;

  const config = statusConfig[employee.status || "Active"] || statusConfig.Active;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex size-10 items-center justify-center bg-[#f0f4f8]">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <div>{employee.firstname} {employee.middlename ? `${employee.middlename} ` : ""}{employee.lastname}</div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
                <span className={`size-1.5 rounded-full ${config.dot}`} />
                {employee.status}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-muted/30 p-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Emp No</p>
                <p className="text-sm mt-1">{employee.emp_no || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">First Name</p>
                <p className="text-sm mt-1">{employee.firstname}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Middle Name</p>
                <p className="text-sm mt-1">{employee.middlename || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Name</p>
                <p className="text-sm mt-1">{employee.lastname}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-sm mt-1">{employee.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact No</p>
                <p className="text-sm mt-1">{employee.contact_no || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</p>
                <p className="text-sm mt-1">{employee.department_name || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="py-3"><hr /></div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created At</p>
                <p className="text-sm mt-1 tabular-nums">
                  {format(new Date(employee.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created By</p>
                <p className="text-sm mt-1">{employee.created_by_name || "N/A"}</p>
              </div>
              {employee.deleted_at && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted At</p>
                    <p className="text-sm mt-1 tabular-nums text-rose-600">
                      {format(new Date(employee.deleted_at), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  {employee.deleted_reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delete Reason</p>
                      <p className="text-sm mt-1 text-rose-600">{employee.deleted_reason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
                <p className="text-sm mt-1 tabular-nums">
                  {employee.updated_at
                    ? format(new Date(employee.updated_at), "MMMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated By</p>
                <p className="text-sm mt-1">{employee.updated_by_name || "N/A"}</p>
              </div>
              {employee.deleted_at && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deleted By</p>
                  <p className="text-sm mt-1 text-rose-600">{employee.deleted_by_name || "N/A"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
