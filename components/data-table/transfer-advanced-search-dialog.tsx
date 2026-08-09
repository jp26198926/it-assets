"use client";

import { useState, useEffect } from "react";
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
import type { TransferFilters } from "@/lib/types/transfer";

interface TransferAdvancedSearchDialogProps {
  onSearch: (filters: TransferFilters) => void;
  onClear: () => void;
}

export function TransferAdvancedSearchDialog({
  onSearch,
  onClear,
}: TransferAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searchFromLocationId, setSearchFromLocationId] = useState("");
  const [searchToLocationId, setSearchToLocationId] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open && locations.length === 0) {
      import("@/lib/actions/location-actions").then(({ getLocations }) => {
        getLocations().then((data) => {
          setLocations(data.map((l: { id: string; name: string }) => ({ id: l.id, name: l.name })));
        });
      }).catch(() => {});
    }
  }, [open, locations.length]);

  const handleSearch = () => {
    const filters: TransferFilters = {};
    if (searchCode) filters.code = searchCode;
    if (searchFromLocationId) filters.from_location_id = searchFromLocationId;
    if (searchToLocationId) filters.to_location_id = searchToLocationId;
    if (searchStatus) filters.status = searchStatus;
    if (searchDateFrom) filters.date_from = searchDateFrom;
    if (searchDateTo) filters.date_to = searchDateTo;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchCode("");
    setSearchFromLocationId("");
    setSearchToLocationId("");
    setSearchStatus("");
    setSearchDateFrom("");
    setSearchDateTo("");
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
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Search across multiple fields directly in the database.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-code">Code</Label>
              <Input
                id="search-code"
                placeholder="e.g., TRAN00001"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-status">Status</Label>
              <Select
                value={searchStatus || "none"}
                onValueChange={(value) => setSearchStatus(value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Location</Label>
              <Select
                value={searchFromLocationId || "none"}
                onValueChange={(value) => setSearchFromLocationId(value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Locations</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Location</Label>
              <Select
                value={searchToLocationId || "none"}
                onValueChange={(value) => setSearchToLocationId(value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Locations</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-date-from">Date From</Label>
              <Input
                id="search-date-from"
                type="date"
                value={searchDateFrom}
                onChange={(e) => setSearchDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-date-to">Date To</Label>
              <Input
                id="search-date-to"
                type="date"
                value={searchDateTo}
                onChange={(e) => setSearchDateTo(e.target.value)}
              />
            </div>
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
