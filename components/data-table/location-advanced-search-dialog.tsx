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
import type { LocationFilters } from "@/lib/types/location";

interface LocationAdvancedSearchDialogProps {
  onSearch: (filters: LocationFilters) => void;
  onClear: () => void;
}

export function LocationAdvancedSearchDialog({
  onSearch,
  onClear,
}: LocationAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState("");

  const handleSearch = () => {
    const filters: LocationFilters = {};
    if (searchName) filters.name = searchName;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchName("");
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
            <Label htmlFor="search-name">Name</Label>
            <Input
              id="search-name"
              placeholder="Location name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
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
