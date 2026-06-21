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
import type { AssetFilters } from "@/lib/types/asset";

interface AssetAdvancedSearchDialogProps {
  onSearch: (filters: AssetFilters) => void;
  onClear: () => void;
}

export function AssetAdvancedSearchDialog({
  onSearch,
  onClear,
}: AssetAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [searchSerialNumber, setSearchSerialNumber] = useState("");

  const handleSearch = () => {
    const filters: AssetFilters = {};
    if (searchBarcode) filters.barcode = searchBarcode;
    if (searchSerialNumber) filters.serial_number = searchSerialNumber;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchBarcode("");
    setSearchSerialNumber("");
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-barcode">Barcode</Label>
              <Input
                id="search-barcode"
                placeholder="Asset barcode..."
                value={searchBarcode}
                onChange={(e) => setSearchBarcode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-serial">Serial Number</Label>
              <Input
                id="search-serial"
                placeholder="Serial number..."
                value={searchSerialNumber}
                onChange={(e) => setSearchSerialNumber(e.target.value)}
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
