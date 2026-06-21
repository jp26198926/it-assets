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
import type { ItemFilters } from "@/lib/types/item";

interface ItemAdvancedSearchDialogProps {
  onSearch: (filters: ItemFilters) => void;
  onClear: () => void;
}

export function ItemAdvancedSearchDialog({
  onSearch,
  onClear,
}: ItemAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchItemCode, setSearchItemCode] = useState("");
  const [searchBrand, setSearchBrand] = useState("");
  const [searchModel, setSearchModel] = useState("");

  const handleSearch = () => {
    const filters: ItemFilters = {};
    if (searchName) filters.name = searchName;
    if (searchItemCode) filters.item_code = searchItemCode;
    if (searchBrand) filters.brand = searchBrand;
    if (searchModel) filters.model = searchModel;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchName("");
    setSearchItemCode("");
    setSearchBrand("");
    setSearchModel("");
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
              <Label htmlFor="search-name">Name</Label>
              <Input
                id="search-name"
                placeholder="Item name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-item-code">Item Code</Label>
              <Input
                id="search-item-code"
                placeholder="e.g., P000001"
                value={searchItemCode}
                onChange={(e) => setSearchItemCode(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-brand">Brand</Label>
              <Input
                id="search-brand"
                placeholder="Brand name..."
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-model">Model</Label>
              <Input
                id="search-model"
                placeholder="Model number..."
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
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
