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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getLocations } from "@/lib/actions/location-actions";
import { getItems } from "@/lib/actions/item-actions";
import type { AdjustmentFilters } from "@/lib/types/adjustment";
import type { Location } from "@/lib/types/location";
import type { Item } from "@/lib/types/item";

interface AdjustmentAdvancedSearchDialogProps {
  onSearch: (filters: AdjustmentFilters) => void;
  onClear: () => void;
}

export function AdjustmentAdvancedSearchDialog({
  onSearch,
  onClear,
}: AdjustmentAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");

  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      getLocations().catch(() => [] as Location[]),
      getItems().catch(() => [] as Item[]),
    ]).then(([locs, its]) => {
      setLocations(locs.filter((l) => !l.deleted_at).sort((a, b) => a.name.localeCompare(b.name)));
      setItems(its.filter((i) => !i.deleted_at).sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, [open]);

  const handleSearch = () => {
    const filters: AdjustmentFilters = {};
    if (searchCode) filters.code = searchCode;
    if (searchLocation) filters.location_id = searchLocation;
    if (searchItem) filters.item_id = searchItem;
    if (searchDateFrom) filters.date_from = searchDateFrom;
    if (searchDateTo) filters.date_to = searchDateTo;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchCode("");
    setSearchLocation("");
    setSearchItem("");
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
              <Label htmlFor="search-code">Code</Label>
              <Input
                id="search-code"
                placeholder="e.g. ADJ00001"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-location">Location</Label>
              <SearchableSelect
                value={searchLocation}
                onValueChange={setSearchLocation}
                options={locations.map((loc) => ({ id: loc.id, name: loc.name }))}
                placeholder="All locations"
                searchPlaceholder="Search locations..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-item">Item</Label>
              <SearchableSelect
                value={searchItem}
                onValueChange={setSearchItem}
                options={items.map((item) => ({ id: item.id, name: `${item.name}${item.item_code ? ` (${item.item_code})` : ""}` }))}
                placeholder="All items"
                searchPlaceholder="Search items..."
              />
            </div>
            <div />
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
