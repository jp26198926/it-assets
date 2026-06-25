"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { AssignmentFilters } from "@/lib/types/assignment";

interface AssignmentAdvancedSearchDialogProps {
  onSearch: (filters: AssignmentFilters) => void;
  onClear: () => void;
}

export function AssignmentAdvancedSearchDialog({
  onSearch,
  onClear,
}: AssignmentAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [searchAssetId, setSearchAssetId] = useState("");
  const [searchEmployeeId, setSearchEmployeeId] = useState("");

  const handleSearch = () => {
    const filters: AssignmentFilters = {};
    if (searchStatus) filters.status = searchStatus;
    if (searchAssetId) filters.asset_id = searchAssetId;
    if (searchEmployeeId) filters.employee_id = searchEmployeeId;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchStatus("");
    setSearchAssetId("");
    setSearchEmployeeId("");
    onClear();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Search className="mr-1 h-4 w-4" />
          Advanced Search
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Search across multiple fields directly in the database.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="search-status">Status</Label>
            <Select value={searchStatus} onValueChange={setSearchStatus}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-asset-id">Asset ID</Label>
            <Input
              id="search-asset-id"
              placeholder="Asset ID..."
              value={searchAssetId}
              onChange={(e) => setSearchAssetId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-employee-id">Employee ID</Label>
            <Input
              id="search-employee-id"
              placeholder="Employee ID..."
              value={searchEmployeeId}
              onChange={(e) => setSearchEmployeeId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleSearch}>
            <Search className="mr-1 h-4 w-4" />
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
