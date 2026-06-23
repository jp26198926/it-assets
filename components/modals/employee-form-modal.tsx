"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEmployeeSelectOptions } from "@/lib/actions/employee-actions";
import type { Employee, CreateEmployeeInput } from "@/lib/types/employee";

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSubmit: (data: CreateEmployeeInput) => Promise<void>;
}

const defaultFormData: CreateEmployeeInput = {
  emp_no: "",
  firstname: "",
  middlename: "",
  lastname: "",
  email: "",
  contact_no: "",
  department_id: undefined,
};

export function EmployeeFormModal({
  open,
  onOpenChange,
  employee,
  onSubmit,
}: EmployeeFormModalProps) {
  const [formData, setFormData] = useState<CreateEmployeeInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      getEmployeeSelectOptions()
        .then((options) => setDepartments(options.departments))
        .catch(() => {})
        .finally(() => setOptionsLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (employee) {
      setFormData({
        emp_no: employee.emp_no || "",
        firstname: employee.firstname,
        middlename: employee.middlename || "",
        lastname: employee.lastname,
        email: employee.email || "",
        contact_no: employee.contact_no || "",
        department_id: employee.department_id || undefined,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [employee, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstname) newErrors.firstname = "First name is required";
    if (!formData.lastname) newErrors.lastname = "Last name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          ...formData,
          emp_no: formData.emp_no || undefined,
          middlename: formData.middlename || undefined,
          email: formData.email || undefined,
          contact_no: formData.contact_no || undefined,
          department_id: formData.department_id || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save employee" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {employee
              ? "Update the employee information below."
              : "Fill in the details to add a new employee."}
          </DialogDescription>
        </DialogHeader>
        <form id="employee-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emp_no">Emp No</Label>
              <Input
                id="emp_no"
                value={formData.emp_no || ""}
                onChange={(e) =>
                  setFormData({ ...formData, emp_no: e.target.value })
                }
                placeholder="e.g., EMP001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstname">First Name *</Label>
              <Input
                id="firstname"
                value={formData.firstname}
                onChange={(e) =>
                  setFormData({ ...formData, firstname: e.target.value })
                }
                placeholder="e.g., Juan"
                className={errors.firstname ? "border-red-500" : ""}
              />
              {errors.firstname && (
                <p className="text-xs text-red-500">{errors.firstname}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="middlename">Middle Name</Label>
              <Input
                id="middlename"
                value={formData.middlename || ""}
                onChange={(e) =>
                  setFormData({ ...formData, middlename: e.target.value })
                }
                placeholder="e.g., Santos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name *</Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={(e) =>
                  setFormData({ ...formData, lastname: e.target.value })
                }
                placeholder="e.g., Dela Cruz"
                className={errors.lastname ? "border-red-500" : ""}
              />
              {errors.lastname && (
                <p className="text-xs text-red-500">{errors.lastname}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="e.g., juan@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_no">Contact No</Label>
              <Input
                id="contact_no"
                value={formData.contact_no || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contact_no: e.target.value })
                }
                placeholder="e.g., 09123456789"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department_id || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  department_id: value === "none" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={optionsLoading ? "Loading..." : "Select department"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Department</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="employee-form" disabled={loading}>
            {loading ? "Saving..." : employee ? "Save Changes" : "Add Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
