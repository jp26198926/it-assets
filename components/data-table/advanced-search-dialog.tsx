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
import { type Table } from "@tanstack/react-table";

interface AdvancedSearchDialogProps<TData> {
  table: Table<TData>;
  allData: TData[];
}

export function AdvancedSearchDialog<TData>({
  table,
}: AdvancedSearchDialogProps<TData>) {
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchAssetTag, setSearchAssetTag] = useState("");
  const [searchBrand, setSearchBrand] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [searchSerial, setSearchSerial] = useState("");
  const [searchAssignedTo, setSearchAssignedTo] = useState("");

  const handleSearch = () => {
    const searchTerms = [
      searchName,
      searchAssetTag,
      searchBrand,
      searchModel,
      searchSerial,
      searchAssignedTo,
    ]
      .filter(Boolean)
      .join(" ");

    table.setGlobalFilter(searchTerms);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchName("");
    setSearchAssetTag("");
    setSearchBrand("");
    setSearchModel("");
    setSearchSerial("");
    setSearchAssignedTo("");
    table.setGlobalFilter("");
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
            Search across multiple fields simultaneously. Simulates backend query.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Name</Label>
              <Input
                id="search-name"
                placeholder="Asset name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-tag">Asset Tag</Label>
              <Input
                id="search-tag"
                placeholder="AST-XXXX"
                value={searchAssetTag}
                onChange={(e) => setSearchAssetTag(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-brand">Brand</Label>
              <Input
                id="search-brand"
                placeholder="e.g., Dell, HP..."
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-model">Model</Label>
              <Input
                id="search-model"
                placeholder="e.g., Latitude 5540..."
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-serial">Serial Number</Label>
              <Input
                id="search-serial"
                placeholder="Serial number..."
                value={searchSerial}
                onChange={(e) => setSearchSerial(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-assigned">Assigned To</Label>
              <Input
                id="search-assigned"
                placeholder="Person name..."
                value={searchAssignedTo}
                onChange={(e) => setSearchAssignedTo(e.target.value)}
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
