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
import type { SupplierFilters } from "@/lib/types/supplier";

interface SupplierAdvancedSearchDialogProps {
  onSearch: (filters: SupplierFilters) => void;
  onClear: () => void;
}

export function SupplierAdvancedSearchDialog({
  onSearch,
  onClear,
}: SupplierAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const handleSearch = () => {
    const filters: SupplierFilters = {};
    if (searchName) filters.name = searchName;
    if (searchContact) filters.contact_person = searchContact;
    if (searchPhone) filters.phone = searchPhone;
    if (searchEmail) filters.email = searchEmail;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchName("");
    setSearchContact("");
    setSearchPhone("");
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
              <Label htmlFor="search-name">Name</Label>
              <Input
                id="search-name"
                placeholder="Supplier name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-contact">Contact Person</Label>
              <Input
                id="search-contact"
                placeholder="Contact person..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-phone">Phone</Label>
              <Input
                id="search-phone"
                placeholder="Phone number..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
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
