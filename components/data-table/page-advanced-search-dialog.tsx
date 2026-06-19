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
import type { PageFilters } from "@/lib/types/page";

interface PageAdvancedSearchDialogProps {
  onSearch: (filters: PageFilters) => void;
  onClear: () => void;
}

export function PageAdvancedSearchDialog({
  onSearch,
  onClear,
}: PageAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchPath, setSearchPath] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [searchSection, setSearchSection] = useState("");

  const handleSearch = () => {
    const filters: PageFilters = {};
    if (searchName) filters.name = searchName;
    if (searchPath) filters.path = searchPath;
    if (searchDescription) filters.description = searchDescription;
    if (searchSection) filters.section = searchSection;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchName("");
    setSearchPath("");
    setSearchDescription("");
    setSearchSection("");
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
                placeholder="Page name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-path">Path</Label>
              <Input
                id="search-path"
                placeholder="/dashboard..."
                value={searchPath}
                onChange={(e) => setSearchPath(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-description">Description</Label>
              <Input
                id="search-description"
                placeholder="Description..."
                value={searchDescription}
                onChange={(e) => setSearchDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-section">Section</Label>
              <Input
                id="search-section"
                placeholder="Section..."
                value={searchSection}
                onChange={(e) => setSearchSection(e.target.value)}
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
