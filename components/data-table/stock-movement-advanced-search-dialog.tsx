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
import type { StockMovementFilters } from "@/lib/types/stock-movement";

interface StockMovementAdvancedSearchDialogProps {
  onSearch: (filters: StockMovementFilters) => void;
  onClear: () => void;
}

export function StockMovementAdvancedSearchDialog({
  onSearch,
  onClear,
}: StockMovementAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [itemName, setItemName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSearch = () => {
    const filters: StockMovementFilters = {};
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    if (transactionType) filters.transaction_type = transactionType;
    if (itemName) filters.item_name = itemName;
    if (locationName) filters.location_name = locationName;
    if (reference) filters.reference_description = reference;
    if (remarks) filters.remarks = remarks;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setDateFrom("");
    setDateTo("");
    setTransactionType("");
    setItemName("");
    setLocationName("");
    setReference("");
    setRemarks("");
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
            Search stock movements directly in the database.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-date-from">Date From</Label>
              <Input
                id="search-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-date-to">Date To</Label>
              <Input
                id="search-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-trans-type">Transaction Type</Label>
              <select
                id="search-trans-type"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All Types</option>
                <option value="RECEIVE">RECEIVE</option>
                <option value="RELEASE">RELEASE</option>
                <option value="ADJUSTMENT">ADJUSTMENT</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-item">Item</Label>
              <Input
                id="search-item"
                placeholder="Item name..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-location">Location</Label>
              <Input
                id="search-location"
                placeholder="Location name..."
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-reference">Reference</Label>
              <Input
                id="search-reference"
                placeholder="Reference description..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-remarks">Remarks</Label>
              <Input
                id="search-remarks"
                placeholder="Remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
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
