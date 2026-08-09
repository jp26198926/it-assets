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
import type { StockLevelFilters } from "@/lib/types/stock-level";

interface StockLevelAdvancedSearchDialogProps {
  onSearch: (filters: StockLevelFilters) => void;
  onClear: () => void;
}

export function StockLevelAdvancedSearchDialog({
  onSearch,
  onClear,
}: StockLevelAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [locationName, setLocationName] = useState("");
  const [qtyMin, setQtyMin] = useState("");
  const [qtyMax, setQtyMax] = useState("");

  const handleSearch = () => {
    const filters: StockLevelFilters = {};
    if (itemName) filters.item_name = itemName;
    if (itemCode) filters.item_code = itemCode;
    if (locationName) filters.location_name = locationName;
    if (qtyMin) filters.qty_min = Number(qtyMin);
    if (qtyMax) filters.qty_max = Number(qtyMax);

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setItemName("");
    setItemCode("");
    setLocationName("");
    setQtyMin("");
    setQtyMax("");
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
            Search stock levels directly in the database.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-item-name">Item Name</Label>
              <Input
                id="search-item-name"
                placeholder="Item name..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-item-code">Item Code</Label>
              <Input
                id="search-item-code"
                placeholder="Item code..."
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
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
              <Label htmlFor="search-qty-min">Qty Min</Label>
              <Input
                id="search-qty-min"
                type="number"
                placeholder="Minimum qty..."
                value={qtyMin}
                onChange={(e) => setQtyMin(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-qty-max">Qty Max</Label>
              <Input
                id="search-qty-max"
                type="number"
                placeholder="Maximum qty..."
                value={qtyMax}
                onChange={(e) => setQtyMax(e.target.value)}
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
