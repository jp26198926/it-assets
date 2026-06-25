"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { getAssignmentSelectOptions } from "@/lib/actions/assignment-actions";
import type { Assignment, CreateAssignmentInput } from "@/lib/types/assignment";

interface AssignmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assignment | null;
  defaultAssetId?: string | null;
  onSubmit: (data: CreateAssignmentInput) => Promise<void>;
}

const defaultFormData: CreateAssignmentInput = {
  asset_id: "",
  employee_id: "",
  department_id: "",
  location_id: "",
  assigned_date: "",
  condition_on_issue: "",
  remarks: "",
  status: "Active",
};

export function AssignmentFormModal({
  open,
  onOpenChange,
  assignment,
  defaultAssetId,
  onSubmit,
}: AssignmentFormModalProps) {
  const [formData, setFormData] =
    useState<CreateAssignmentInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [assets, setAssets] = useState<
    { id: string; barcode: string; itemName: string }[]
  >([]);
  const [employees, setEmployees] = useState<
    { id: string; name: string; departmentId: string | null }[]
  >([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [locations, setLocations] = useState<
    { id: string; name: string }[]
  >([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [assignTo, setAssignTo] = useState<"employee" | "department">(
    "employee",
  );
  const [assetSearch, setAssetSearch] = useState("");
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      const currentAssetId = assignment?.asset_id;
      getAssignmentSelectOptions(currentAssetId)
        .then((options) => {
          setAssets(options.assets);
          setEmployees(options.employees);
          setDepartments(options.departments);
          setLocations(options.locations);
        })
        .catch(() => {})
        .finally(() => setOptionsLoading(false));
    }
  }, [open, assignment?.asset_id]);

  useEffect(() => {
    if (assignment) {
      setFormData({
        asset_id: assignment.asset_id,
        employee_id: assignment.employee_id || "",
        department_id: assignment.department_id || "",
        location_id: assignment.location_id || "",
        assigned_date: assignment.assigned_date
          ? new Date(assignment.assigned_date).toISOString().split("T")[0]
          : "",
        condition_on_issue: assignment.condition_on_issue,
        remarks: assignment.remarks || "",
        status: assignment.status,
      });
      setAssignTo(assignment.employee_id ? "employee" : "department");
      setAssetSearch("");
    } else {
      setFormData({
        ...defaultFormData,
        asset_id: defaultAssetId || "",
        assigned_date: new Date().toISOString().split("T")[0],
      });
      setAssignTo("employee");
      setAssetSearch("");
    }
    setErrors({});
    setAssetDropdownOpen(false);
  }, [assignment, open, defaultAssetId]);

  const filteredAssets = useMemo(() => {
    if (!assetSearch) return assets;
    const q = assetSearch.toLowerCase();
    return assets.filter(
      (a) =>
        a.barcode.toLowerCase().includes(q) ||
        a.itemName.toLowerCase().includes(q),
    );
  }, [assets, assetSearch]);

  const selectedAsset = assets.find((a) => a.id === formData.asset_id);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.asset_id) newErrors.asset_id = "Asset is required";
    if (!formData.assigned_date)
      newErrors.assigned_date = "Assigned date is required";
    if (!formData.condition_on_issue)
      newErrors.condition_on_issue = "Condition on issue is required";
    if (
      assignTo === "employee" &&
      !formData.employee_id &&
      !formData.department_id
    ) {
      newErrors.assignTo = "Please select an employee or department";
    }
    if (
      assignTo === "department" &&
      !formData.department_id &&
      !formData.employee_id
    ) {
      newErrors.assignTo = "Please select a department";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit(formData);
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save assignment" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl sm:max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>
            {assignment ? "Edit Assignment" : "Add New Assignment"}
          </DialogTitle>
          <DialogDescription>
            {assignment
              ? "Update the assignment information below."
              : "Fill in the details to add a new assignment."}
          </DialogDescription>
        </DialogHeader>
        <form
          id="assignment-form"
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto min-h-0"
        >
          {/* Asset - Full Width */}
          <div className="space-y-2">
            <Label>Asset *</Label>
            {assignment ? (
              <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-sm">
                {selectedAsset
                  ? `${selectedAsset.barcode} — ${selectedAsset.itemName}`
                  : assignment.asset_id}
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8] z-10" />
                  <Input
                    value={
                      assetDropdownOpen
                        ? assetSearch
                        : selectedAsset
                          ? `${selectedAsset.barcode} — ${selectedAsset.itemName}`
                          : ""
                    }
                    onChange={(e) => {
                      setAssetSearch(e.target.value);
                      setAssetDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setAssetDropdownOpen(true);
                      setAssetSearch("");
                    }}
                    placeholder="Search by barcode or item name..."
                    className={`pl-9 ${errors.asset_id ? "border-red-500" : ""}`}
                    disabled={optionsLoading}
                  />
                  {assetDropdownOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#e2e8f0] shadow-lg max-h-60 overflow-y-auto">
                      {filteredAssets.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-[#64748b]">
                          No assets available
                        </div>
                      ) : (
                        filteredAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-[#f0f4f8] text-sm flex items-center justify-between ${
                              formData.asset_id === asset.id ? "bg-[#eff6ff]" : ""
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFormData({ ...formData, asset_id: asset.id });
                              setAssetDropdownOpen(false);
                              setAssetSearch("");
                            }}
                          >
                            <span className="font-medium text-[#1a1f36]">
                              {asset.barcode}
                            </span>
                            <span className="text-[#64748b]">{asset.itemName}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.asset_id && (
                  <p className="text-xs text-red-500">{errors.asset_id}</p>
                )}
              </>
            )}
          </div>

          {/* Assign To + Assigned Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assign To */}
            <div className="space-y-2">
              <Label>Assign To</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={assignTo === "employee" ? "default" : "outline"}
                  size="sm"
                  className={
                    assignTo === "employee"
                      ? "bg-[#3b82f6] hover:bg-[#2563eb]"
                      : ""
                  }
                  onClick={() => {
                    setAssignTo("employee");
                    setFormData({
                      ...formData,
                      department_id: "",
                      employee_id: formData.employee_id || "",
                    });
                  }}
                >
                  Employee
                </Button>
                <Button
                  type="button"
                  variant={assignTo === "department" ? "default" : "outline"}
                  size="sm"
                  className={
                    assignTo === "department"
                      ? "bg-[#3b82f6] hover:bg-[#2563eb]"
                      : ""
                  }
                  onClick={() => {
                    setAssignTo("department");
                    setFormData({
                      ...formData,
                      employee_id: "",
                      department_id: formData.department_id || "",
                    });
                  }}
                >
                  Department
                </Button>
              </div>
              {errors.assignTo && (
                <p className="text-xs text-red-500">{errors.assignTo}</p>
              )}
            </div>
          </div>

          {/* Employee or Department Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assignTo === "employee" ? (
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select
                  value={formData.employee_id || ""}
                  onValueChange={(value) => {
                    const emp = employees.find((e) => e.id === value);
                    setFormData({
                      ...formData,
                      employee_id: value,
                      department_id: emp?.departmentId || "",
                    });
                  }}
                  disabled={optionsLoading}
                >
                  <SelectTrigger
                    className={`w-full ${errors.assignTo ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={formData.department_id || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      department_id: value,
                      employee_id: "",
                    })
                  }
                  disabled={optionsLoading}
                >
                  <SelectTrigger
                    className={`w-full ${errors.assignTo ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep) => (
                      <SelectItem key={dep.id} value={dep.id}>
                        {dep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Assigned Date */}
            <div className="space-y-2">
              <Label htmlFor="assigned_date">Assigned Date *</Label>
              <Input
                id="assigned_date"
                type="date"
                value={formData.assigned_date}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_date: e.target.value })
                }
                className={errors.assigned_date ? "border-red-500" : ""}
              />
              {errors.assigned_date && (
                <p className="text-xs text-red-500">{errors.assigned_date}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={formData.location_id || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, location_id: value })
              }
              disabled={optionsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition_on_issue">Condition on Issue *</Label>
            <Input
              id="condition_on_issue"
              value={formData.condition_on_issue}
              onChange={(e) =>
                setFormData({ ...formData, condition_on_issue: e.target.value })
              }
              placeholder="e.g., Good, Excellent, Fair"
              className={errors.condition_on_issue ? "border-red-500" : ""}
            />
            {errors.condition_on_issue && (
              <p className="text-xs text-red-500">
                {errors.condition_on_issue}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks || ""}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="Additional notes or remarks..."
              rows={3}
            />
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
          <Button type="submit" form="assignment-form" disabled={loading}>
            {loading
              ? "Saving..."
              : assignment
                ? "Save Changes"
                : "Add Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
