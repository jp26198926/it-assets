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
import type { UserFilters } from "@/lib/types/user";

interface UserAdvancedSearchDialogProps {
  onSearch: (filters: UserFilters) => void;
  onClear: () => void;
}

export function UserAdvancedSearchDialog({
  onSearch,
  onClear,
}: UserAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchFirstName, setSearchFirstName] = useState("");
  const [searchLastName, setSearchLastName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const handleSearch = () => {
    const filters: UserFilters = {};
    if (searchFirstName) filters.first_name = searchFirstName;
    if (searchLastName) filters.last_name = searchLastName;
    if (searchEmail) filters.email = searchEmail;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchFirstName("");
    setSearchLastName("");
    setSearchEmail("");
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
              <Label htmlFor="search-first-name">First Name</Label>
              <Input
                id="search-first-name"
                placeholder="First name..."
                value={searchFirstName}
                onChange={(e) => setSearchFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-last-name">Last Name</Label>
              <Input
                id="search-last-name"
                placeholder="Last name..."
                value={searchLastName}
                onChange={(e) => setSearchLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-email">Email</Label>
            <Input
              id="search-email"
              placeholder="Email address..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
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
